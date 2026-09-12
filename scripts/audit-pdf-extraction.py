"""逐文件、逐物理页检查转录；无异常字符不等于公式完整。"""
import argparse
import json
from pathlib import Path
import re
import unicodedata

PAGE = re.compile(r'^## 物理页 (\d+)\n\n(?P<fence>`{3,})text\n(.*?)\n(?P=fence)\n', re.M | re.S)


def inspect(root):
    manifest = json.loads((root / 'manifest.json').read_text('utf8'))
    result = {}
    for entry in manifest['entries']:
        if entry['format'] != 'pdf' or entry['status'] == 'withheld':
            continue
        if not entry['text_path']:
            raise ValueError(f'PDF 无转录：{entry["path"]}')
        text = (root / entry['text_path']).read_text('utf8')
        pages = list(PAGE.finditer(text))
        if [int(p[1]) for p in pages] != list(range(1, entry['units'] + 1)):
            raise ValueError(f'页码不连续：{entry["path"]}')
        result[entry['id']] = {
            'path': entry['path'], 'source_sha256': entry['sha256'], 'source_url': entry['source_url'],
            'pages': len(pages), 'automatic_pages': [], 'visual_pages': [], 'anomaly_pages': [],
            'warnings': sorted(set(entry['warnings'])),
        }
        for page in pages:
            number, content = int(page[1]), page[3]
            for marker, key in [('自动提取修复', 'automatic_pages'), ('视觉转录修订', 'visual_pages')]:
                if content.startswith('[' + marker):
                    result[entry['id']][key].append(number)
            if damaged(content):
                result[entry['id']]['anomaly_pages'].append(number)
    return result


def damaged(text):
    return bool(re.search(r'\[(?:U|BYTE)\+[0-9A-Fa-f]+\]|\(cid:\d+\)|\ufffd', text)
                or any(unicodedata.category(c) == 'Co' for c in text))


def main():
    assert damaged('[U+0014]') and damaged('\ue000') and damaged('(cid:10)')
    assert not damaged('≤≥×−⎧⎨⎩')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1] / 'sources/wzj52501')
    parser.add_argument('--baseline', type=Path)
    parser.add_argument('--output', type=Path, help='生成 JSON 报告；未指定时仅输出统计')
    args = parser.parse_args()
    current = inspect(args.root)
    baseline = inspect(args.baseline) if args.baseline else None
    if baseline:
        if current.keys() != baseline.keys() or any(current[k]['source_sha256'] != baseline[k]['source_sha256'] for k in current):
            raise ValueError('比较两侧必须是同一来源快照')
        for key, item in current.items():
            item['before_anomaly_pages'] = baseline[key]['anomaly_pages']
    summary = {'files': len(current), 'pages': sum(e['pages'] for e in current.values()),
               'automatic_pages': sum(len(e['automatic_pages']) for e in current.values()),
               'visual_pages': sum(len(e['visual_pages']) for e in current.values()),
               'anomaly_files': sum(bool(e['anomaly_pages']) for e in current.values()),
               'anomaly_pages': sum(len(e['anomaly_pages']) for e in current.values())}
    if baseline:
        summary['before_anomaly_pages'] = sum(len(e['anomaly_pages']) for e in baseline.values())
    report = {'limitations': '仅统计显式异常；上下标、分数、图片、裁剪与阅读顺序仍需原页核对。',
              'summary': summary, 'files': current}
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == '__main__':
    main()
