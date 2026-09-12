"""python -X utf8 -m unittest discover -s tests -p test_pdf_visibility.py"""
import importlib.util
from pathlib import Path
import unittest

from pypdf import PdfReader, PdfWriter
from pypdf.generic import (ArrayObject, DecodedStreamObject, DictionaryObject,
                           FloatObject, NameObject, NumberObject)


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/pdf_visibility.py"
UPSTREAM = Path(__file__).resolve().parents[4] / "artifacts/full-library-audit/upstream"


def filter_page(page):
    if not SCRIPT.exists():
        return {"filtered_text_operations": 0, "warnings": []}
    spec = importlib.util.spec_from_file_location("pdf_visibility", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.filter_invisible_text(page)


def page_with(content):
    writer = PdfWriter()
    page = writer.add_blank_page(400, 400)
    font = DictionaryObject({NameObject("/Type"): NameObject("/Font"),
        NameObject("/Subtype"): NameObject("/Type1"),
        NameObject("/BaseFont"): NameObject("/Helvetica"),
        NameObject("/FontDescriptor"): DictionaryObject({NameObject("/FontBBox"):
            ArrayObject([NumberObject(n) for n in (-100, -200, 1000, 900)])}),
        NameObject("/FirstChar"): NumberObject(0),
        NameObject("/Widths"): ArrayObject([NumberObject(500)] * 256)})
    states = DictionaryObject({NameObject(name): DictionaryObject({
        NameObject(key): FloatObject(value) for key, value in values.items()})
        for name, values in {"/Fill0": {"/ca": 0}, "/Stroke0": {"/CA": 0},
                             "/Both0": {"/ca": 0, "/CA": 0},
                             "/Faint": {"/ca": 0.001}}.items()})
    page[NameObject("/Resources")] = DictionaryObject({
        NameObject("/Font"): DictionaryObject({NameObject("/F1"): font}),
        NameObject("/ExtGState"): states})
    stream = DecodedStreamObject()
    stream.set_data(b"BT /F1 12 Tf 20 300 Td " + content + b" ET")
    page[NameObject("/Contents")] = stream
    return page


class PdfVisibilityTests(unittest.TestCase):
    def test_exact_transparency_render_modes_and_saved_state(self):
        page = page_with(b"q /Fill0 gs (HIDDEN_FILL) Tj Q (VISIBLE) Tj "
            b"q /Fill0 gs 1 Tr (STROKE) Tj Q "
            b"q /Stroke0 gs 0 Tr (FILL) Tj Q "
            b"q /Both0 gs 2 Tr (HIDDEN_BOTH) Tj Q "
            b"q 3 Tr (HIDDEN_TR3) Tj Q q 7 Tr (HIDDEN_TR7) Tj Q "
            b"q /Faint gs (FAINT) Tj Q 1 g (WHITE) Tj")
        self.assertIn("HIDDEN", page.extract_text())
        report = filter_page(page)
        text = page.extract_text()
        self.assertNotIn("HIDDEN", text)
        for word in ("VISIBLE", "STROKE", "FILL", "FAINT", "WHITE"):
            self.assertIn(word, text)
        self.assertEqual(report["filtered_text_operations"], 4)

    def test_hidden_shows_keep_glyph_advances_spacing_and_line_moves(self):
        page = page_with(b"q 3 Tr 2 Tc 3 Tw [(A ) 120 (B)] TJ Q "
                         b"3 Tr (C) ' 4 5 (D) \" 0 Tr (VISIBLE) Tj")
        report = filter_page(page)
        self.assertEqual(report["filtered_text_operations"], 3)
        ops = page.get_contents().operations
        arrays = [args[0] for args, op in ops if op == b"TJ"]
        self.assertAlmostEqual(float(arrays[0][0]), -(1000 + 7000 / 12), places=4)
        self.assertEqual(arrays[0][1], 120)
        self.assertAlmostEqual(float(arrays[0][2]), -(500 + 2000 / 12), places=4)
        self.assertEqual(sum(op == b"T*" for _, op in ops), 2)
        self.assertIn("VISIBLE", page.extract_text())

    def test_unknown_widths_are_preserved_with_warning(self):
        page = page_with(b"3 Tr (KEEP_UNKNOWN) Tj")
        del page["/Resources"]["/Font"]["/F1"]["/Widths"]
        report = filter_page(page)
        self.assertIn("KEEP_UNKNOWN", page.extract_text())
        self.assertTrue(report["warnings"])

    def test_off_page_filter_preserves_cross_boundary_and_restored_text(self):
        page = page_with(b"q 1 0 0 1 2000 2000 cm (OFFPAGE) Tj Q "
                         b"1 0 0 1 -10 200 Tm (CROSSBOUNDARY) Tj "
                         b"1 0 0 1 20 100 Tm (VISIBLE) Tj")
        filter_page(page)
        self.assertNotIn("OFFPAGE", page.extract_text())
        self.assertIn("CROSSBOUNDARY", page.extract_text())
        self.assertIn("VISIBLE", page.extract_text())

    def test_filter_is_idempotent_and_keeps_unhandled_geometry(self):
        page = page_with(b"q 3 Tr (HIDDEN) Tj Q "
                         b"q 0 1 -1 0 2000 2000 cm (ROTATED) Tj Q "
                         b"q 1 Tr 3000 w 1 0 0 1 -1000 0 cm (STROKED) Tj Q")
        filter_page(page)
        text = page.extract_text()
        self.assertIn("ROTATED", text)
        self.assertIn("STROKED", text)
        self.assertEqual(filter_page(page)["filtered_text_operations"], 0)
        self.assertEqual(text, page.extract_text())

    def test_real_search_overlay(self):
        paths = list(UPSTREAM.glob("*/Lectures/Search.pdf"))
        if not paths:
            self.skipTest("固定原件未在本地展开")
        reader = PdfReader(paths[0])
        pages = [reader.pages[40], reader.pages[41]]
        self.assertTrue(all("h(x)" in page.extract_text() for page in pages))
        for page in pages:
            filter_page(page)
        self.assertNotIn("h(x)", pages[0].extract_text())
        self.assertIn("h(x)", pages[1].extract_text())
        self.assertTrue(all("f(x)" in page.extract_text() for page in pages))

    def test_real_dynamic_programming_hidden_recurrence(self):
        paths = list(UPSTREAM.glob("*/Lectures/Dynamic-Programming.pdf"))
        if not paths:
            self.skipTest("固定原件未在本地展开")
        original = paths[0].read_bytes()
        page = PdfReader(paths[0]).pages[7]
        self.assertIn("转移时考虑最后一次", page.extract_text())
        filter_page(page)
        text = page.extract_text()
        self.assertNotIn("转移时考虑最后一次", text)
        self.assertNotIn("初始 f0", text)
        self.assertIn("每次他可以向上走 1 级或 2 级或 3 级", text)
        self.assertIn("998244353", text)
        self.assertEqual(original, paths[0].read_bytes())


if __name__ == "__main__":
    unittest.main()
