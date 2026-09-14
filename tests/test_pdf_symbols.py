"""PUA 修复回归；内嵌最小字体，不下载原件。"""
import base64
import importlib
import io
from pathlib import Path
import sys
import unittest

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject as A, DictionaryObject as D, NameObject as N, DecodedStreamObject as Stream

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))


def stream(data):
    obj = Stream()
    obj.set_data(data)
    return obj


def symbol_pdf(target='F02B', unknown=False, cid_map='/Identity', nested=False):
    builder = FontBuilder(2048, isTTF=True)
    builder.setupGlyphOrder(['.notdef', 'anonymous'])
    pen = TTGlyphPen(None)
    # 固定快照 Mock-1/statements.pdf p3 SymbolMT 加号字形；来源证据见 pdf-symbol-evidence.json。
    points = [(514, 1050), (612, 1050), (612, 572), (1087, 572), (1087, 475), (612, 475),
              (612, 0), (514, 0), (514, 475), (37, 475), (37, 572), (514, 572)]
    if unknown:
        points[0] = (515, 1050)
    pen.moveTo(points[0])
    for point in points[1:]:
        pen.lineTo(point)
    pen.closePath()
    builder.setupGlyf({'.notdef': TTGlyphPen(None).glyph(), 'anonymous': pen.glyph()})
    builder.setupHorizontalMetrics({'.notdef': (1000, 0), 'anonymous': (1124, 37)})
    builder.setupHorizontalHeader(ascent=1600, descent=-400)
    builder.setupCharacterMap({0xF02B: 'anonymous'})
    builder.setupNameTable({'familyName': 'Anonymous', 'styleName': 'Regular'})
    builder.setupOS2()
    builder.setupPost()
    builder.setupMaxp()
    data = io.BytesIO()
    builder.save(data)
    unicode_map = f'1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n1 beginbfchar\n<0001> <{target}>\nendbfchar'.encode()
    font = D({N('/Type'): N('/Font'), N('/Subtype'): N('/Type0'), N('/BaseFont'): N('/Anonymous'),
              N('/Encoding'): N('/Identity-H'), N('/ToUnicode'): stream(unicode_map),
              N('/DescendantFonts'): A([D({N('/Subtype'): N('/CIDFontType2'), N('/CIDToGIDMap'): N(cid_map),
                  N('/FontDescriptor'): D({N('/FontFile2'): stream(data.getvalue())})})])})
    resources = D({N('/Font'): D({N('/F1'): font})})
    writer = PdfWriter()
    page = writer.add_blank_page(200, 200)
    if nested:
        form = stream(b'BT /F1 12 Tf 20 100 Td <0001> Tj ET')
        form[N('/Subtype')] = N('/Form')
        form[N('/Resources')] = resources
        page[N('/Resources')] = D({N('/XObject'): D({N('/Fm'): form})})
        page[N('/Contents')] = stream(b'/Fm Do')
    else:
        page[N('/Resources')] = resources
        page[N('/Contents')] = stream(b'BT /F1 12 Tf 20 100 Td <0001> Tj ET')
    data = io.BytesIO()
    writer.write(data)
    return PdfReader(io.BytesIO(data.getvalue()))


class SymbolTests(unittest.TestCase):
    def setUp(self):
        self.assertTrue((Path(__file__).resolve().parents[1] / 'scripts/pdf_symbols.py').exists(),
                        '需实现基于字形证据的 PUA 修复模块')
        self.repair = importlib.import_module('pdf_symbols').repair_symbol_encodings

    def test_lcircle_corners_require_exact_embedded_font_and_glyph(self):
        module = importlib.import_module('pdf_symbols')
        self.assertTrue(hasattr(module, 'verified_cff_symbol'), '需实现按字体哈希核验圆角字形的入口')
        # 432 字节原始内嵌CFF，destiny.pdf p3；保留字体内置AMS版权声明。
        data = base64.b64decode(
            'AQAEBAABAQERVk1VTFFEK0xDSVJDTEUxMAABAQE6HPgwHPgwHAf4HAf4BfgfAPggAfghAvgiA/gXBB0AAAEAER0AAAD3Dx0AAADzEB0AAAAHHQAAAakSAAgBAQMFBwkQgYqPYTBhMWEyYTMwMDMuMDAyQ29weXJpZ2h0IChjKSAxOTk3LCAyMDA5IEFtZXJpY2FuIE1hdGhlbWF0aWNhbCBTb2NpZXR5ICg8aHR0cDovL3d3dy5hbXMub3JnPiksIHdpdGggUmVzZXJ2ZWQgRm9udCBOYW1lIExDSVJDTEUxMC5MQ0lSQ0xFMTBMYVRlWAAAAQEAAwABhwGIAYkBigAFAQEEK1N6ofiIDvgki7MBi7MD+0gW7tw6KICUgpaWlJSW9w0o7vsNgIKCgICUgpYfDvgki7MBi7MDi/dwFSg6OiiAgoKAgJSClvcN7u73DZaClICAgoKAHg74JIuzAYuzA/dwFpaUlJaWgpSAKDrc7paClICAgoKA+w3uKPcNHw74JIuzAYuzA/tIBICUgpaWlJSW7tzc7paUlJaWgpSA+w0oKPsNHg6zCrML9+EU')
        self.assertEqual(''.join(module.verified_cff_symbol(data, name) for name in ['a3', 'a0', 'a2', 'a1']), '╭╮╰╯')
        self.assertEqual(module.verified_cff_symbol(data, 'a4'), '')
        self.assertEqual(module.verified_cff_symbol(data + b'changed', 'a0'), '')

    def test_anonymous_embedded_glyph_is_repaired_and_idempotent(self):
        reader = symbol_pdf()
        self.assertEqual(reader.pages[0].extract_text(), '\uf02b')
        self.assertEqual(self.repair(reader), [])
        self.assertEqual(reader.pages[0].extract_text(), '+')
        self.assertEqual(self.repair(reader), [])

    def test_unknown_outline_and_nonidentity_cid_map_stay_unmodified(self):
        for kwargs in [{'unknown': True}, {'cid_map': '/Unknown'}]:
            with self.subTest(kwargs=kwargs):
                reader = symbol_pdf(**kwargs)
                before = reader.pages[0]['/Resources']['/Font']['/F1']['/ToUnicode'].get_data()
                self.assertTrue(self.repair(reader))
                self.assertEqual(reader.pages[0]['/Resources']['/Font']['/F1']['/ToUnicode'].get_data(), before)
                self.assertEqual(reader.pages[0].extract_text(), '\uf02b')

    def test_existing_correct_unicode_is_not_overwritten(self):
        reader = symbol_pdf(target='002D')
        before = reader.pages[0]['/Resources']['/Font']['/F1']['/ToUnicode'].get_data()
        self.assertEqual(self.repair(reader), [])
        self.assertEqual(reader.pages[0]['/Resources']['/Font']['/F1']['/ToUnicode'].get_data(), before)
        self.assertEqual(reader.pages[0].extract_text(), '-')

    def test_nested_form_font_is_repaired(self):
        reader = symbol_pdf(nested=True)
        self.assertEqual(self.repair(reader), [])
        self.assertIn('+', reader.pages[0].extract_text())

    def test_cff_brace_parts_use_embedded_names(self):
        from fontTools.pens.t2CharStringPen import T2CharStringPen
        builder = FontBuilder(1000, isTTF=False)
        names = ['.notdef', 'bracelefttp', 'braceleftmid', 'braceleftbt', 'unidentified']
        builder.setupGlyphOrder(names)
        builder.setupCFF('Test', {}, {name: T2CharStringPen(500, None).getCharString() for name in names}, {})
        encoding = ['.notdef'] * 256
        for code, name in enumerate(names[1:], 1):
            encoding[code] = name
        builder.font['CFF '].cff[0].Encoding = encoding
        data = io.BytesIO()
        builder.font['CFF '].cff.compile(data, builder.font)
        embedded = stream(data.getvalue())
        embedded[N('/Subtype')] = N('/Type1C')
        font = D({N('/Subtype'): N('/Type1'), N('/BaseFont'): N('/Anonymous'),
                  N('/FontDescriptor'): D({N('/FontFile3'): embedded}),
                  N('/ToUnicode'): stream(b'1 begincodespacerange\n<00> <FF>\nendcodespacerange\n4 beginbfchar\n<01> <F8F1>\n<02> <F8F2>\n<03> <F8F3>\n<04> <F000>\nendbfchar')})
        reader = symbol_pdf()
        reader.pages[0]['/Resources']['/Font'][N('/F1')] = font
        reader.pages[0][N('/Contents')] = stream(b'BT /F1 12 Tf 20 100 Td <01020304> Tj ET')
        warnings = self.repair(reader)
        self.assertEqual(reader.pages[0].extract_text(), '⎧⎨⎩\uf000')
        self.assertTrue(warnings)


if __name__ == '__main__':
    unittest.main()
