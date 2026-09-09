import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { validateLibrary as validatePinnedLibrary } from '../scripts/validate-library.mjs';
const validateLibrary = (root) => validatePinnedLibrary(root, { verifySnapshot: false });

const hash = (text) => createHash('sha256').update(text).digest('hex');
const commit = '7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e';
function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'exp-library-'));
  const sourcePath = 'Lectures/a.pdf';
  const text = '# PDF page 1\nA state keeps future-relevant information.\n';
  const entry = {
    id: `wzj52501-${hash(sourcePath).slice(0, 16)}`, path: sourcePath,
    sha256: hash('original PDF'), git_blob_sha1: 'a'.repeat(40), bytes: 12,
    format: 'pdf', role: 'lecture', group: 'Lectures',
    source_url: `https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/${commit}/${sourcePath}`,
    license: 'CC-BY-NC-SA-4.0', attribution: 'wzj52501', status: 'needs-review',
    text_path: `text/${sourcePath}.md`, text_sha256: hash(text), units: 1,
    warnings: ['Formula and layout need original-page review'], duplicate_of: null,
  };
  const manifest = { version: 1, upstream: { repository: 'wzj52501/awesome-competitive-olympiad-algorithms', commit }, entries: [entry] };
  mkdirSync(join(root, 'licenses'), { recursive: true });
  for (const name of ['LICENSE', 'CONTENT-LICENSE.md']) {
    const content = `test license ${name}`;
    manifest.entries.push({ ...entry, id: `wzj52501-${hash(name).slice(0, 16)}`, path: name,
      format: name === 'LICENSE' ? 'text' : 'md', group: '.', role: 'metadata', status: 'metadata',
      source_url: `https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/${commit}/${name}`,
      sha256: hash(content), text_path: null, text_sha256: null, units: 0 });
    writeFileSync(join(root, 'licenses', name), content);
  }
  const save = () => writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest));
  mkdirSync(join(root, 'text/Lectures'), { recursive: true });
  writeFileSync(join(root, entry.text_path), text);
  save();
  try { run({ root, manifest, entry, save }); } finally { rmSync(root, { recursive: true, force: true }); }
}

test('validates an extracted source and a withheld source without treating either as association active', () => fixture(({ root, entry, save }) => {
  assert.equal(validateLibrary(root).entries, 3);
  const textFile = join(root, entry.text_path);
  entry.status = 'withheld'; entry.text_path = null; entry.text_sha256 = null; entry.units = 0;
  entry.license = 'unconfirmed'; entry.warnings = ['Third-party attribution requires confirmation']; save();
  assert.throws(() => validateLibrary(root), /残留/);
  rmSync(textFile);
  assert.equal(validateLibrary(root).counts.withheld, 1);
}));

test('rejects broken IDs, unsafe paths, unpinned sources, inconsistent statuses and dangling duplicate links', () => {
  for (const mutate of [
    ({ entry }) => { entry.id = 'wrong'; },
    ({ entry }) => { entry.path = '../escape.pdf'; },
    ({ entry }) => { entry.path = 'C:/escape.pdf'; },
    ({ entry }) => { entry.text_path = '../outside.md'; },
    ({ entry }) => { entry.source_url = 'https://example.com/unrelated'; },
    ({ entry }) => { entry.status = 'active'; },
    ({ entry }) => { entry.status = 'failed'; entry.warnings = []; },
    ({ entry }) => { entry.text_path = null; entry.text_sha256 = null; },
    ({ entry }) => { entry.duplicate_of = 'missing-source'; },
    ({ manifest, entry }) => { manifest.entries.push({ ...entry }); },
  ]) fixture((f) => { mutate(f); f.save(); assert.throws(() => validateLibrary(f.root)); });
});

test('detects changed or missing extracted text', () => fixture(({ root, entry }) => {
  writeFileSync(join(root, entry.text_path), 'truncated');
  assert.throws(() => validateLibrary(root), /hash|哈希/i);
  rmSync(join(root, entry.text_path));
  assert.throws(() => validateLibrary(root), /missing|不存在/i);
}));

test('rejects altered licenses and a manifest that is not the pinned complete snapshot', () => fixture(({ root }) => {
  assert.throws(() => validatePinnedLibrary(root), /快照/);
  writeFileSync(join(root, 'licenses/LICENSE'), 'changed');
  assert.throws(() => validateLibrary(root), /许可/);
  rmSync(join(root, 'licenses/LICENSE'));
  assert.throws(() => validateLibrary(root), /许可/);
}));
