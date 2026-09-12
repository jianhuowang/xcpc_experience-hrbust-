"""内嵌字体编码回归；不下载字体或依赖上游文件。"""
import io
import importlib.util
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))


def encoded_pdf():
    from fontTools.fontBuilder import FontBuilder
    from fontTools.pens.t2CharStringPen import T2CharStringPen
    from pypdf import PdfWriter
    from pypdf.generic import DictionaryObject as D, NameObject as N, DecodedStreamObject, NumberObject, ArrayObject
    builder = FontBuilder(1000, isTTF=False)
    names = ['.notdef', 'lessequal', 'greaterequal', 'multiply', 'a0']
    builder.setupGlyphOrder(names)
    strings = {}
    for name in names:
        pen = T2CharStringPen(500, None)
        strings[name] = pen.getCharString()
    builder.setupCFF('Test', {}, strings, {})
    encoding = ['.notdef'] * 256
    for code, name in zip([20, 21, 2, 1], names[1:]):
        encoding[code] = name
    cff = builder.font['CFF '].cff
    cff[0].Encoding = encoding
    data = io.BytesIO()
    cff.compile(data, builder.font)
    stream = DecodedStreamObject()
    stream.set_data(data.getvalue())
    stream[N('/Subtype')] = N('/Type1C')
    font = D({N('/Type'): N('/Font'), N('/Subtype'): N('/Type1'), N('/BaseFont'): N('/Test'),
              N('/FirstChar'): NumberObject(0), N('/LastChar'): NumberObject(21),
              N('/Widths'): ArrayObject([NumberObject(500)] * 22),
              N('/FontDescriptor'): D({N('/FontFile3'): stream})})
    writer = PdfWriter()
    for _ in range(2):
        page = writer.add_blank_page(200, 200)
        page[N('/Resources')] = D({N('/Font'): D({N('/F1'): font})})
        content = DecodedStreamObject()
        content.set_data(b'BT /F1 12 Tf 20 100 Td <14150201> Tj ET')
        page[N('/Contents')] = content
    result = io.BytesIO()
    writer.write(result)
    return result.getvalue()


class FontTests(unittest.TestCase):
    def test_partial_unicode_map_keeps_explicit_entries_and_fills_missing_codes(self):
        from pypdf import PdfReader
        from pypdf.generic import NameObject, DecodedStreamObject
        from pdf_fonts import repair_font_encodings
        reader = PdfReader(io.BytesIO(encoded_pdf()))
        mapping = DecodedStreamObject()
        mapping.set_data(b'1 begincodespacerange\n<00> <FF>\nendcodespacerange\n1 beginbfchar\n<14> <005A>\nendbfchar\n')
        font = reader.pages[0]['/Resources']['/Font']['/F1']
        font[NameObject('/ToUnicode')] = mapping
        repair_font_encodings(reader)
        self.assertEqual(reader.pages[0].extract_text(), 'Z≥×\x01')

    def test_importer_repairs_all_pages_and_keeps_raw_hash_binding(self):
        spec = importlib.util.spec_from_file_location('import_library', Path(__file__).resolve().parents[1] / 'scripts/import-library.py')
        library = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(library)
        data = encoded_pdf()
        repaired, count = library.extract(data, 'pdf', [])
        self.assertEqual(count, 2)
        self.assertEqual(repaired.count('≤≥×'), 2)
        self.assertIn('[U+0001]', repaired)
        raw, _ = library.extract(data, 'pdf', [], pdf_repairs=False)
        first = raw.split('## 物理页 2')[0].rstrip('\n') + '\n'
        record = {'extracted_sha256': library.sha256(first.encode()), 'text': '视觉核对正文'}
        result = library.correct_body(repaired, {1: record}, original_body=raw)
        self.assertIn('视觉核对正文', result)
        self.assertIn('≤≥×', result)
        with self.assertRaises(ValueError):
            library.correct_body(repaired, {1: {**record, 'extracted_sha256': '0' * 64}}, original_body=raw)

    def test_embedded_encoding_recovers_symbols_without_guessing_unknown_glyph(self):
        from pypdf import PdfReader
        from pdf_fonts import repair_font_encodings
        reader = PdfReader(io.BytesIO(encoded_pdf()))
        self.assertEqual(reader.pages[0].extract_text(), '\x14\x15\x02\x01')
        warnings = repair_font_encodings(reader)
        self.assertEqual(reader.pages[0].extract_text(), '≤≥×\x01')
        self.assertEqual(reader.pages[1].extract_text(), '≤≥×\x01')
        self.assertTrue(any('a0' in item for item in warnings))
        # 显式 Unicode 映射优先；再次运行不覆盖已有映射。
        before = reader.pages[0]['/Resources']['/Font']['/F1']['/ToUnicode'].get_data()
        repair_font_encodings(reader)
        self.assertEqual(reader.pages[0]['/Resources']['/Font']['/F1']['/ToUnicode'].get_data(), before)


if __name__ == '__main__':
    unittest.main()
