import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, isAbsolute, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = 'wzj52501/awesome-competitive-olympiad-algorithms';
const pinnedCommit = '7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e';
const pinnedTree = '9b62c53007461516a51835246de04464a91f18c58f31f0b2e4914183468dfd00';
const statuses = new Set(['extracted', 'needs-review', 'withheld', 'failed', 'metadata']);
const roles = new Set(['lecture', 'statement', 'solution', 'code', 'metadata']);
const licenses = new Set(['MIT', 'CC-BY-NC-SA-4.0', 'upstream-metadata', 'unconfirmed']);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const encode = (part) => encodeURIComponent(part).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
function requireValue(condition, message) { if (!condition) throw new Error(message); }
function safePath(path) {
  return typeof path === 'string' && path.length > 0 && !/[\\:<>"|?*\x00-\x1f]/.test(path)
    && !path.startsWith('/') && path.split('/').every((part) => part && !['.', '..'].includes(part)
      && !/[. ]$/.test(part) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
}

export function validateLibrary(root, { verifySnapshot = true } = {}) {
  root = realpathSync(root);
  const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
  requireValue(manifest.version === 1 && manifest.upstream?.repository === repository, '无法识别来源清单');
  const commit = manifest.upstream.commit;
  requireValue(typeof commit === 'string' && /^[a-f0-9]{40}$/.test(commit), '来源必须固定到完整 commit');
  requireValue(Array.isArray(manifest.entries) && manifest.entries.length > 0, '来源清单不能为空');
  const ids = new Map(), paths = new Set(), counts = {};
  for (const entry of manifest.entries) {
    requireValue(safePath(entry.path), `不安全的原路径：${entry.path}`);
    requireValue(entry.id === `wzj52501-${sha256(entry.path).slice(0, 16)}`, `来源 ID 不匹配：${entry.path}`);
    requireValue(!ids.has(entry.id) && !paths.has(entry.path.toLowerCase()), `重复来源 ID 或路径：${entry.path}`);
    ids.set(entry.id, entry); paths.add(entry.path.toLowerCase());
    requireValue(/^[a-f0-9]{64}$/.test(entry.sha256) && /^[a-f0-9]{40}$/.test(entry.git_blob_sha1), `无效原文哈希：${entry.id}`);
    requireValue(Number.isSafeInteger(entry.bytes) && entry.bytes >= 0, `无效文件大小：${entry.id}`);
    requireValue(statuses.has(entry.status) && roles.has(entry.role) && licenses.has(entry.license), `无效来源分类：${entry.id}`);
    requireValue(typeof entry.attribution === 'string' && entry.attribution.trim(), `缺少来源署名：${entry.id}`);
    const expectedFormat = ['LICENSE', '.gitignore'].includes(posix.basename(entry.path)) ? 'text' : posix.extname(entry.path).slice(1).toLowerCase();
    requireValue(entry.format === expectedFormat && entry.group === posix.dirname(entry.path), `格式或分组不匹配：${entry.id}`);
    const sourceUrl = `https://github.com/${repository}/blob/${commit}/${entry.path.split('/').map(encode).join('/')}`;
    requireValue(entry.source_url === sourceUrl, `来源链接未固定或不匹配：${entry.id}`);
    requireValue(Array.isArray(entry.warnings) && entry.warnings.every((w) => typeof w === 'string' && w.trim()), `无效警告：${entry.id}`);
    requireValue(Number.isSafeInteger(entry.units) && entry.units >= 0, `无效页段数：${entry.id}`);
    if (['needs-review', 'withheld', 'failed'].includes(entry.status)) {
      requireValue(entry.warnings.length > 0, `异常状态需要原因：${entry.id}`);
    }
    if (['withheld', 'failed'].includes(entry.status)) {
      requireValue(entry.text_path === null && entry.text_sha256 === null && entry.units === 0, `不可用来源不得暴露提取正文：${entry.id}`);
      requireValue(!lstatSync(resolve(root, `text/${entry.path}.md`), { throwIfNoEntry: false }), `不可用来源存在残留正文：${entry.id}`);
    } else if (entry.status !== 'metadata' || entry.text_path !== null) {
      requireValue(entry.text_path === `text/${entry.path}.md` && safePath(entry.text_path), `提取路径不匹配：${entry.id}`);
      const textFile = resolve(root, entry.text_path);
      requireValue(existsSync(textFile), `提取正文不存在：${entry.id}`);
      const location = relative(root, realpathSync(textFile));
      requireValue(!isAbsolute(location) && location !== '..' && !location.startsWith(`..${sep}`), `提取正文越界：${entry.id}`);
      requireValue(sha256(readFileSync(textFile)) === entry.text_sha256, `提取正文哈希不匹配：${entry.id}`);
      requireValue(entry.units > 0, `提取正文需要页段定位：${entry.id}`);
    } else {
      requireValue(entry.text_sha256 === null && entry.units === 0, `元数据状态不一致：${entry.id}`);
    }
    counts[entry.status] = (counts[entry.status] ?? 0) + 1;
  }
  for (const entry of manifest.entries) {
    if (entry.duplicate_of === null) continue;
    const original = ids.get(entry.duplicate_of);
    requireValue(original && original.id !== entry.id && original.duplicate_of === null
      && original.sha256 === entry.sha256, `重复来源关联不成立：${entry.id}`);
  }
  for (const name of ['LICENSE', 'CONTENT-LICENSE.md']) {
    const source = manifest.entries.find((entry) => entry.path === name);
    const licenseFile = resolve(root, 'licenses', name);
    requireValue(source && existsSync(licenseFile) && sha256(readFileSync(licenseFile)) === source.sha256, `原始许可缺失或哈希不匹配：${name}`);
  }
  if (verifySnapshot) {
    const tree = [...manifest.entries].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
      .map((entry) => `${entry.path}\0${entry.git_blob_sha1}\n`).join('');
    requireValue(commit === pinnedCommit && sha256(tree) === pinnedTree, '清单内容与固定上游快照不符');
  }
  return { entries: ids.size, counts };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(validateLibrary(resolve(process.argv[2] ?? 'sources/wzj52501')), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
