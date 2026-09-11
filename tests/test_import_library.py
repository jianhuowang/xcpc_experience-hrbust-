"""运行：python -X utf8 -m unittest discover -s tests -p test_import_library.py。"""
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch
import zipfile


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/import-library.py"
ROOT = "awesome-competitive-olympiad-algorithms-7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/"


def package(files):
    result = io.BytesIO()
    with zipfile.ZipFile(result, "w") as archive:
        for name, content in files.items():
            info = zipfile.ZipInfo(name)
            info.filename = name  # Windows ZipInfo 构造器会归一化反斜杠；测试须写出真正的坏路径。
            archive.writestr(info, content)
    return result.getvalue()


def pdf():
    from pypdf import PdfWriter
    from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject
    writer = PdfWriter()
    page = writer.add_blank_page(200, 200)
    font = DictionaryObject({NameObject("/Type"): NameObject("/Font"),
                             NameObject("/Subtype"): NameObject("/Type1"),
                             NameObject("/BaseFont"): NameObject("/Helvetica")})
    page[NameObject("/Resources")] = DictionaryObject({NameObject("/Font"):
        DictionaryObject({NameObject("/F1"): writer._add_object(font)})})
    stream = DecodedStreamObject()
    stream.set_data(b"BT /F1 12 Tf 20 100 Td (first page) Tj ET")
    page[NameObject("/Contents")] = writer._add_object(stream)
    writer.add_blank_page(200, 200)
    result = io.BytesIO()
    writer.write(result)
    return result.getvalue()


class ImportLibraryTests(unittest.TestCase):
    def test_visual_corrections_are_bound_to_source_and_extracted_page(self):
        path = "Lectures/ok.pdf"
        archive = self.archive({path: pdf()})
        files = self.library.read_archive(archive)
        body, _ = self.library.extract(files[path], "pdf", [])
        original = body.split("## 物理页 2")[0].rstrip("\n") + "\n"
        record = {"id": "wzj52501-" + hashlib.sha256(path.encode()).hexdigest()[:16],
                  "path": path, "source_sha256": hashlib.sha256(files[path]).hexdigest(),
                  "page": 1, "extracted_sha256": hashlib.sha256(original.encode()).hexdigest(),
                  "text": "first page ≤ 10^7", "reason": "原页对照回归"}
        self.library.import_archive(archive, self.output, corrections=[record])
        content = (self.output / "text/Lectures/ok.pdf.md").read_text("utf8")
        self.assertIn("first page ≤ 10^7", content)
        self.assertIn("视觉转录修订", content)
        self.assertIn("## 物理页 2", content)
        manifest = json.loads((self.output / "manifest.json").read_text("utf8"))
        self.assertEqual(next(e for e in manifest["entries"] if e["path"] == path)["status"], "needs-review")
        before = (self.output / "manifest.json").read_bytes()
        for change in [{"source_sha256": "0" * 64}, {"extracted_sha256": "0" * 64},
                       {"id": "wrong"}, {"page": 3}, {"text": ""}]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.library.import_archive(archive, self.output, corrections=[{**record, **change}])
            self.assertEqual((self.output / "manifest.json").read_bytes(), before)
        with self.assertRaises(ValueError):
            self.library.import_archive(archive, self.output, corrections=[record, record])
        blocked = "Lectures/Basic-Algorithms_cjl.pdf"
        with self.assertRaises(ValueError):
            self.library.import_archive(self.archive({blocked: files[path]}), self.output,
                corrections=[{**record, "path": blocked,
                              "id": "wzj52501-" + hashlib.sha256(blocked.encode()).hexdigest()[:16]}])

    def setUp(self):
        self.assertTrue(SCRIPT.exists(), "需先实现离线归档导入器")
        spec = importlib.util.spec_from_file_location("import_library", SCRIPT)
        self.library = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.library)
        self.pin = patch.object(self.library, "EXPECTED_TREE_SHA256", None, create=True)
        self.pin.start()
        self.addCleanup(self.pin.stop)
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.output = self.base / "out"

    def archive(self, files=None):
        files = {"LICENSE": b"MIT license fixture", "CONTENT-LICENSE.md": b"CC BY-NC-SA 4.0",
                 **(files or {})}
        fingerprint = "".join(name + "\0" + hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest() + "\n"
                              for name, data in sorted(files.items()))
        self.library.EXPECTED_TREE_SHA256 = hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()
        target = self.base / "source.zip"
        target.write_bytes(package({ROOT + name: data for name, data in files.items()}))
        return target

    def run_import(self, files):
        self.library.import_archive(self.archive(files), self.output)
        manifest = json.loads((self.output / "manifest.json").read_text("utf-8"))
        return {entry["path"]: entry for entry in manifest["entries"]}

    def test_repeatable_raw_text_hashes_and_duplicates(self):
        raw = b"// keep tabs\r\n\tint main() {}\r\n"
        archive = self.archive({"Setter/A/z.cpp": raw, "Setter/A/a.cpp": raw,
                                "README.md": "# 中文\n原文".encode()})
        self.library.import_archive(archive, self.output)
        before = {p.relative_to(self.output).as_posix(): p.read_bytes()
                  for p in self.output.rglob("*") if p.is_file()}
        self.library.import_archive(archive, self.output)
        self.assertEqual(before, {p.relative_to(self.output).as_posix(): p.read_bytes()
                                 for p in self.output.rglob("*") if p.is_file()})
        data = json.loads(before["manifest.json"])
        entries = {e["path"]: e for e in data["entries"]}
        first, duplicate = entries["Setter/A/a.cpp"], entries["Setter/A/z.cpp"]
        self.assertEqual(first["sha256"], hashlib.sha256(raw).hexdigest())
        self.assertEqual(first["git_blob_sha1"], hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest())
        self.assertEqual(duplicate["duplicate_of"], first["id"])
        self.assertIn(raw, before[first["text_path"]])
        self.assertIn("原始行 1–2".encode(), before[first["text_path"]])
        self.assertEqual(first["license"], "MIT")
        self.assertEqual(entries["README.md"]["status"], "metadata")
        self.assertEqual(before["licenses/LICENSE"], b"MIT license fixture")

    def test_invalid_archive_keeps_existing_output(self):
        self.output.mkdir()
        marker = self.output / "manifest.json"
        marker.write_text("old", encoding="utf-8")
        for name in ["../escape.cpp", "/absolute.cpp", "a/../../escape.cpp", "C:/evil.cpp",
                     "a\\b.cpp", "a/CON.cpp", "a/file. "]:
            with self.subTest(name=name):
                with self.assertRaises(ValueError):
                    self.library.import_archive(self.archive({name: b"bad"}), self.output)
                self.assertEqual(marker.read_text(), "old")
        for files in [{"A.cpp": b"a", "a.cpp": b"b"}, {"A/x.cpp": b"a", "a/y.cpp": b"b"}]:
            with self.assertRaises(ValueError):
                self.library.import_archive(self.archive(files), self.output)
        target = self.archive()
        with zipfile.ZipFile(target, "a") as archive:
            symlink = zipfile.ZipInfo(ROOT + "link.cpp")
            symlink.create_system = 3
            symlink.external_attr = (stat.S_IFLNK | 0o777) << 16
            archive.writestr(symlink, "elsewhere")
        with self.assertRaises(ValueError):
            self.library.import_archive(target, self.output)
        target.write_bytes(package({ROOT + "README.md": b"missing licenses"}))
        with self.assertRaises(ValueError):
            self.library.import_archive(target, self.output)
        self.assertEqual(marker.read_text(), "old")

    def test_pdf_pages_empty_warning_and_failures(self):
        entries = self.run_import({"Lectures/ok.pdf": pdf(), "Lectures/bad.pdf": b"invalid"})
        entry = entries["Lectures/ok.pdf"]
        content = (self.output / entry["text_path"]).read_text("utf-8")
        self.assertIn("## 物理页 1", content)
        self.assertIn("first page", content)
        self.assertIn("## 物理页 2", content)
        self.assertEqual(entry["units"], 2)
        self.assertEqual(entry["status"], "needs-review")
        self.assertTrue(any("2" in w and "空" in w for w in entry["warnings"]))
        self.assertEqual(entries["Lectures/bad.pdf"]["status"], "failed")
        self.assertIsNone(entries["Lectures/bad.pdf"]["text_path"])

    def test_snapshot_pin_rejects_modified_missing_and_added_files(self):
        archive = self.archive({"Setter/A/a.cpp": b"int main() {}"})
        with zipfile.ZipFile(archive) as source:
            original = {name: source.read(name) for name in source.namelist()}
        self.output.mkdir()
        marker = self.output / "manifest.json"
        marker.write_bytes(b"old manifest")
        altered = [dict(original, **{ROOT + "Setter/A/a.cpp": b"changed"}),
                   {name: data for name, data in original.items() if not name.endswith("a.cpp")},
                   dict(original, **{ROOT + "extra.cpp": b"extra"})]
        for files in altered:
            with self.subTest(files=list(files)):
                archive.write_bytes(package(files))
                with self.assertRaisesRegex(ValueError, "快照指纹"):
                    self.library.import_archive(archive, self.output)
                self.assertEqual(marker.read_bytes(), b"old manifest")

    def test_fetch_verifies_download_before_replacing_cache(self):
        archive = self.archive()
        archive.write_bytes(b"old cache")
        download = package({ROOT + "LICENSE": b"tampered", ROOT + "CONTENT-LICENSE.md": b"CC"})
        with patch("sys.argv", [str(SCRIPT), "fetch", "--archive", str(archive)]), \
             patch.object(self.library.urllib.request, "urlopen", return_value=io.BytesIO(download)), \
             patch("sys.stderr", new_callable=io.StringIO) as errors:
            with self.assertRaises(SystemExit) as stopped:
                self.library.main()
        self.assertEqual(stopped.exception.code, 1)
        self.assertIn("快照指纹", errors.getvalue())
        self.assertEqual(archive.read_bytes(), b"old cache")

    def test_withheld_or_failed_refuses_stale_text_before_writing(self):
        for path in ["Lectures/Basic-Algorithms_cjl.pdf", "Lectures/bad.pdf"]:
            with self.subTest(path=path):
                stale = self.output / f"text/{path}.md"
                stale.parent.mkdir(parents=True, exist_ok=True)
                stale.write_bytes(b"old source text")
                marker = self.output / "manifest.json"
                marker.write_bytes(b"old manifest")
                with self.assertRaisesRegex(ValueError, "人工处理"):
                    self.library.import_archive(self.archive({path: b"invalid"}), self.output)
                self.assertEqual(stale.read_bytes(), b"old source text")
                self.assertEqual(marker.read_bytes(), b"old manifest")

    def test_withheld_refuses_dangling_text_symlink(self):
        path = "Lectures/Basic-Algorithms_cjl.pdf"
        stale = self.output / f"text/{path}.md"
        stale.parent.mkdir(parents=True)
        try:
            stale.symlink_to(self.base / "missing")
        except OSError as error:
            self.skipTest(f"当前系统不允许创建测试符号链接：{error}")
        self.assertFalse(stale.exists())
        with self.assertRaisesRegex(ValueError, "人工处理"):
            self.library.import_archive(self.archive({path: b"invalid"}), self.output)
        self.assertTrue(stale.is_symlink())
        self.assertFalse((self.output / "manifest.json").exists())

    def test_docx_order_tables_and_pptx_order_notes(self):
        docx = package({"word/document.xml": '''<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>before</w:t></w:r></w:p><w:tbl><w:tr><w:tc><w:p><w:r><w:t>cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl><w:p><w:r><w:t>after</w:t></w:r></w:p></w:body></w:document>'''})
        pptx = package({
            "ppt/presentation.xml": '<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldIdLst><p:sldId r:id="rId2"/><p:sldId r:id="rId1"/></p:sldIdLst></p:presentation>',
            "ppt/_rels/presentation.xml.rels": '<Relationships><Relationship Id="rId1" Target="slides/slide1.xml"/><Relationship Id="rId2" Target="slides/slide2.xml"/></Relationships>',
            "ppt/slides/slide1.xml": '<root xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:p><a:r><a:t>second</a:t></a:r></a:p></root>',
            "ppt/slides/slide2.xml": '<root xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:p><a:r><a:t>first</a:t></a:r></a:p></root>',
            "ppt/slides/_rels/slide2.xml.rels": '<Relationships><Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide1.xml"/></Relationships>',
            "ppt/notesSlides/notesSlide1.xml": '<root xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:p><a:r><a:t>speaker note</a:t></a:r></a:p></root>',
        })
        entries = self.run_import({"Setter/A/statements.docx": docx, "Lectures/test.pptx": pptx})
        document = (self.output / entries["Setter/A/statements.docx"]["text_path"]).read_text("utf-8")
        self.assertLess(document.index("before"), document.index("cell"))
        self.assertLess(document.index("cell"), document.index("after"))
        self.assertIn("段落 3", document)
        self.assertIn("表格 1", document)
        slides = (self.output / entries["Lectures/test.pptx"]["text_path"]).read_text("utf-8")
        self.assertLess(slides.index("first"), slides.index("second"))
        self.assertIn("## 幻灯片 2", slides)
        self.assertIn("speaker note", slides)
        self.assertEqual(entries["Lectures/test.pptx"]["units"], 2)

    def test_withheld_text_and_visible_controls(self):
        entries = self.run_import({"Lectures/Basic-Algorithms_cjl.pdf": b"must never extract",
                                   "Setter/A/solutions.md": b"left\x01right\xff"})
        blocked = entries["Lectures/Basic-Algorithms_cjl.pdf"]
        self.assertEqual(blocked["status"], "withheld")
        self.assertEqual(blocked["license"], "unconfirmed")
        self.assertIsNone(blocked["text_path"])
        entry = entries["Setter/A/solutions.md"]
        text = (self.output / entry["text_path"]).read_text("utf-8")
        self.assertIn("[U+0001]", text)
        self.assertIn("[BYTE+FF]", text)
        self.assertEqual(entry["status"], "needs-review")
        self.assertTrue(entry["warnings"])

    def test_docx_math_and_source_specific_warnings(self):
        document = package({"word/document.xml": '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><w:body><w:p><w:r><w:t>value=</w:t></w:r><m:oMath><m:r><m:t>x+1</m:t></m:r></m:oMath></w:p></w:body></w:document>'})
        entries = self.run_import({"Setter/A/statements.docx": document,
                                   "Setter/NOI/noi2020-final/surreal.cpp": b"int main() {}",
                                   "Setter/NOI/noi2020-final/surreal-README.md": b"O(mn)"})
        entry = entries["Setter/A/statements.docx"]
        self.assertIn("value=x+1", (self.output / entry["text_path"]).read_text("utf-8"))
        self.assertTrue(any("O(mn)" in warning for warning in entries["Setter/NOI/noi2020-final/surreal.cpp"]["warnings"]))
        self.assertEqual(entries["Setter/NOI/noi2020-final/surreal-README.md"]["role"], "solution")


if __name__ == "__main__":
    unittest.main()
