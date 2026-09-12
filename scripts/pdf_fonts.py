"""从内嵌 CFF 的编码恢复缺失 Unicode 映射；不修改原 PDF。"""
import io

from fontTools.agl import toUnicode
from fontTools.cffLib import CFFFontSet
from pypdf._cmap import _parse_to_unicode
from pypdf.generic import DecodedStreamObject, NameObject
from pdf_symbols import verified_cff_symbol


def repair_font_encodings(reader):
    warnings, seen = [], set()

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
            # 明确的 Encoding 优先，不用字体名称猜映射。
            if font.get('/Subtype') != '/Type1' or '/Encoding' in font:
                continue
            descriptor = font.get('/FontDescriptor')
            stream = descriptor.get_object().get('/FontFile3') if descriptor else None
            if stream is None or stream.get_object().get('/Subtype') != '/Type1C':
                continue
            try:
                cff = CFFFontSet()
                font_data = stream.get_object().get_data()
                cff.decompile(io.BytesIO(font_data), None)
                encoding = cff[0].Encoding
                if not isinstance(encoding, list) or len(encoding) != 256:
                    continue  # 标准编码由 pypdf 处理。
                # pypdf 已固定版本；复用它的 CMap 解析，不另写一套 PDF 解析器。
                existing = _parse_to_unicode(font)[0] if '/ToUnicode' in font else {}
                if existing and (existing.get(-1) != 1 or any(
                        not isinstance(k, str) or len(k) != 1 or ord(k) > 255
                        for k in existing if k != -1)):
                    warnings.append(f'字体 {font.get("/BaseFont")} 的 Unicode 映射不是单字节，未自动补全。')
                    continue
                codes = {ord(k): v for k, v in existing.items() if isinstance(k, str)}
                unknown, added = [], False
                for code, glyph in enumerate(encoding):
                    if glyph == '.notdef' or code in codes:
                        continue
                    char = toUnicode(glyph) or verified_cff_symbol(font_data, glyph)
                    if char:
                        codes[code] = char
                        added = True
                    else:
                        unknown.append(glyph)
                if unknown:
                    warnings.append(f'字体 {font.get("/BaseFont")} 的字形无标准 Unicode 映射，未猜测：' + ', '.join(sorted(set(unknown))))
                if not added:
                    continue
                pairs = [f'<{code:02X}> <{char.encode("utf-16-be").hex().upper()}>' for code, char in sorted(codes.items())]
                mapping = ['/CIDInit /ProcSet findresource begin', '12 dict begin', 'begincmap',
                           '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
                           '/CMapName /EmbeddedGlyphUnicode def', '/CMapType 2 def',
                           '1 begincodespacerange', '<00> <FF>', 'endcodespacerange']
                for start in range(0, len(pairs), 100):
                    chunk = pairs[start:start + 100]
                    mapping.extend([f'{len(chunk)} beginbfchar', *chunk, 'endbfchar'])
                mapping.extend(['endcmap', 'CMapName currentdict /CMap defineresource pop', 'end', 'end'])
                unicode_stream = DecodedStreamObject()
                unicode_stream.set_data(('\n'.join(mapping) + '\n').encode('ascii'))
                font[NameObject('/ToUnicode')] = unicode_stream
            except Exception as error:
                warnings.append(f'字体 {font.get("/BaseFont")} 编码恢复失败，保留原提取：{type(error).__name__}: {error}')
        for ref in resources.get('/XObject', {}).values():
            obj = ref.get_object()
            if obj.get('/Subtype') == '/Form' and '/Resources' in obj:
                visit(obj['/Resources'])

    for page in reader.pages:
        visit(page['/Resources'])
    return sorted(set(warnings))
