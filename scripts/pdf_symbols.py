"""仅依据内嵌字形证据修复 PUA ToUnicode；不修改原 PDF。"""
import hashlib
import io
import json
from pathlib import Path
import re
import unicodedata

from fontTools.cffLib import CFFFontSet
from fontTools.pens.recordingPen import RecordingPen
from fontTools.ttLib import TTFont
from pypdf.generic import DecodedStreamObject, NameObject

EVIDENCE = json.loads((Path(__file__).resolve().parents[1] / 'sources/wzj52501/pdf-symbol-evidence.json').read_text('utf-8'))
OUTLINES = {item['outline_sha256']: item['to'] for item in EVIDENCE['symbol_mappings']}
BRACES = {item['glyph_name']: item['to'] for item in EVIDENCE['brace_mappings']}
BFCHAR = re.compile(rb'\bbeginbfchar\b(.*?)\bendbfchar\b', re.S)
PAIR = re.compile(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>')


def verified_cff_symbol(font_data, glyph):
    """a0 等非语义名称只在完整内嵌字体哈希匹配视觉证据时恢复。"""
    return EVIDENCE['cff_font_mappings'].get(hashlib.sha256(font_data).hexdigest(), {}).get(glyph, '')


def repair_symbol_encodings(reader):
    warnings, seen = [], set()

    def repair(font):
        if '/ToUnicode' not in font:
            return
        original = font['/ToUnicode'].get_data()
        blocks = list(BFCHAR.finditer(original))
        pending = {}
        for block in blocks:
            for pair in PAIR.finditer(block[1]):
                char = bytes.fromhex(pair[2].decode()).decode('utf-16-be')
                if len(char) == 1 and unicodedata.category(char) == 'Co':
                    pending[int(pair[1], 16)] = char
        # ponytail: 固定快照仅用 bfchar；其他 CMap 结构保留，新增来源需要时再扩展解析。
        if b'beginbfrange' in original and re.search(rb'<(?:F[0-8][0-9A-F]{2}|[Ee][0-9A-F]{3})>', original):
            warnings.append(f'字体 {font.get("/BaseFont")} 的 bfrange 可能含私用区字形，未自动修复。')
        if not pending:
            return
        replacements = {}
        if font.get('/Subtype') == '/Type0' and font.get('/Encoding') == '/Identity-H':
            child = font['/DescendantFonts'][0].get_object()
            descriptor = child.get('/FontDescriptor')
            if child.get('/Subtype') == '/CIDFontType2' and child.get('/CIDToGIDMap') == '/Identity' and descriptor:
                embedded = descriptor.get_object().get('/FontFile2')
                if embedded is not None:
                    tt = TTFont(io.BytesIO(embedded.get_object().get_data()))
                    order, glyphs = tt.getGlyphOrder(), tt.getGlyphSet()
                    for cid in pending:
                        if cid >= len(order):
                            continue
                        pen = RecordingPen()
                        glyphs[order[cid]].draw(pen)
                        char = OUTLINES.get(hashlib.sha256(repr(pen.value).encode('utf-8')).hexdigest())
                        if char:
                            replacements[cid] = char
        elif font.get('/Subtype') == '/Type1' and '/Encoding' not in font:
            descriptor = font.get('/FontDescriptor')
            embedded = descriptor.get_object().get('/FontFile3') if descriptor else None
            if embedded is not None and embedded.get_object().get('/Subtype') == '/Type1C':
                cff = CFFFontSet()
                cff.decompile(io.BytesIO(embedded.get_object().get_data()), None)
                encoding = cff[0].Encoding
                if isinstance(encoding, list):
                    replacements = {code: BRACES[encoding[code]] for code in pending
                                    if code < len(encoding) and encoding[code] in BRACES}
        unknown = {f'U+{ord(char):04X}' for code, char in pending.items() if code not in replacements}
        if unknown:
            warnings.append(f'字体 {font.get("/BaseFont")} 的私用区字形缺少匹配证据或编码不支持，保留原值：' + ', '.join(sorted(unknown)))
        if not replacements:
            return

        def replace_block(block):
            def replace_pair(pair):
                code = int(pair[1], 16)
                if code not in replacements:
                    return pair[0]
                target = replacements[code].encode('utf-16-be').hex().upper().encode()
                return b'<' + pair[1] + b'> <' + target + b'>'
            return b'beginbfchar' + PAIR.sub(replace_pair, block[1]) + b'endbfchar'
        stream = DecodedStreamObject()
        stream.set_data(BFCHAR.sub(replace_block, original))
        font[NameObject('/ToUnicode')] = stream

    def visit(resources):
        resources = resources.get_object()
        if id(resources) in seen:
            return
        seen.add(id(resources))
        for ref in resources.get('/Font', {}).values():
            font = ref.get_object()
            if id(font) in seen:
                continue
            seen.add(id(font))
            try:
                repair(font)
            except Exception as error:
                warnings.append(f'字体 {font.get("/BaseFont")} 的 PUA 恢复失败，保留原值：{type(error).__name__}: {error}')
        for ref in resources.get('/XObject', {}).values():
            obj = ref.get_object()
            if obj.get('/Subtype') == '/Form' and '/Resources' in obj:
                visit(obj['/Resources'])

    for page in reader.pages:
        if '/Resources' in page:
            visit(page['/Resources'])
    return sorted(set(warnings))
