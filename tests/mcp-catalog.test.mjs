import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadCatalog } from '../mcp/catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const catalog = loadCatalog(root);
const removeTemp = (path) => {
  const resolved = resolve(path), rel = relative(resolve(tmpdir()), resolved);
  assert.ok(rel && !isAbsolute(rel) && !rel.startsWith('..') && basename(resolved).startsWith('xcpc-mcp-'));
  rmSync(resolved, { recursive: true, force: true });
};

test('searches metadata only with synonyms, scope and pagination', () => {
  const association = catalog.search({ query: 'int128', scope: 'association' });
  assert.equal(association.results[0].id, '20260902-jianhuowang-int128-requires-64bit');
  assert.equal(association.results[0].status, 'active');
  assert.match(association.results[0].url, /\/blob\/[a-f0-9]{40}\/.+#L\d+$/);
  assert.equal(catalog.search({ query: 'mincostflow', scope: 'association' }).total, 0);
  assert.ok(catalog.search({ query: '搜索', scope: 'external' }).results.some((x) => x.path === undefined && /Search\.pdf/.test(x.title)));
  assert.ok(catalog.search({ query: '动态规划', scope: 'external', limit: 1, offset: 1 }).total > 1);
  assert.equal(catalog.search({ query: '动态规划', scope: 'external', limit: 1, offset: 1 }).results.length, 1);
});

test('validates search arguments and rejects unknown input', () => {
  for (const args of [{}, { query: '' }, { query: '+++' }, { query: '？' }, { query: '___' }, { query: 'x', limit: 0 }, { query: 'x', offset: -1 },
    { query: 'x', scope: 'private' }, { query: 'x', mode: 'bad' }, { query: 'x', extra: true }]) {
    assert.throws(() => catalog.search(args), /invalid_argument/);
  }
  assert.deepEqual(catalog.search({ query: 'Search', mode: 'H3' }).results, catalog.search({ query: 'Search', mode: 'H1' }).results);
});

test('H1/H2 never return bodies and reference cannot expose solutions', () => {
  const search = catalog.search({ query: 'Search.pdf', scope: 'external' }).results[0];
  assert.equal(catalog.fetch({ id: search.id, mode: 'H1' }).text, '');
  assert.equal(catalog.fetch({ id: search.id, mode: 'H2' }).text, '');
  const solution = catalog.search({ query: 'bishop-solution', scope: 'external' }).results[0];
  assert.equal(catalog.fetch({ id: solution.id, mode: 'reference' }).metadata.access, 'requires_H3');
  const result = catalog.fetch({ id: solution.id, mode: 'H3', unit: 'paragraph', start: 1, count: 4 });
  assert.match(result.text, /算法一/);
  assert.match(result.metadata.location, /段落 1–4/);
  assert.equal(result.metadata.direct_solution, true);
});

test('fetches visual and automatic repairs without promoting review status', () => {
  const item = catalog.search({ query: 'Search.pdf', scope: 'external' }).results[0];
  const page = catalog.fetch({ id: item.id, mode: 'H3', unit: 'page', start: 41, count: 1 });
  assert.match(page.metadata.location, /物理页 41/);
  assert.match(page.text, /f\(x\) \+ g\(x\) ≤ cans/);
  assert.doesNotMatch(page.text, /h\(x\)|U\+001[45]/);
  assert.equal(page.metadata.status, 'needs-review');
  assert.match(page.text, /视觉转录修订/);
  assert.match(catalog.fetch({ id: item.id, mode: 'reference', start: 42 }).text, /h\(x\) ≥ g\(x\)/);
  const fractions = catalog.fetch({ id: item.id, mode: 'reference', start: 43, count: 1 });
  assert.match(fractions.text, /19\/45 = 1\/5 \+ 1\/6 \+ 1\/18/);
  assert.match(fractions.text, /a ≤ b ≤ 100/);
  assert.match(fractions.text, /视觉转录修订/);
  const automatic = catalog.fetch({ id: item.id, mode: 'reference', start: 20, count: 1 });
  assert.match(automatic.text, /自动提取修复/);
  assert.equal(automatic.metadata.status, 'needs-review');
  assert.match(catalog.fetch({ id: item.id, mode: 'reference', start: 11 }).text, /n × n[\s\S]*1 ≤ n ≤ 8/);
  const dp = catalog.fetch({ id: 'wzj52501-6cc8051f4f4f2148', mode: 'reference', start: 8 });
  assert.match(dp.text, /n ≤ 10\^7/);
  const recurrence = catalog.fetch({ id: dp.metadata.id, mode: 'reference', start: 9, count: 1 });
  assert.match(recurrence.text, /f_i = f_\{i-1\} \+ f_\{i-2\} \+ f_\{i-3\}/);
  assert.doesNotMatch(recurrence.text, /f_0/); // 初始条件只在下一张动画页出现。
  assert.throws(() => catalog.fetch({ id: item.id, mode: 'H3', unit: 'line' }), /invalid_argument/);
  assert.throws(() => catalog.fetch({ id: item.id, mode: 'H3', unit: 'page', start: 1, count: 6 }), /invalid_argument/);
});

test('recovered destiny samples retain page boundaries and satisfy the statement', () => {
  const fetchPage = (start) => catalog.fetch({ id: 'wzj52501-9efd5abc5b968d9c', mode: 'H3', start, count: 1 }).text;
  const page3 = fetchPage(3), page4 = fetchPage(4);
  const numericLines = (text) => text.split('\n').filter((line) => /^\d+(?: \d+)*$/.test(line));
  const first = numericLines(page3.split('【样例 1 输入】')[1].split('【样例 1 输出】')[0]);
  const secondHead = numericLines(page3.split('【样例 2 输入】')[1]);
  const secondTail = numericLines(page4.split('【样例 2 输出】')[0]);
  assert.equal(first.length, 7);
  assert.equal(secondHead.length, 6);
  assert.equal(secondTail.length, 16);
  // 独立枚举每条边是否重要，检查每个约束路径至少含一条重要边。
  for (const [lines, expected] of [[first, 8], [[...secondHead, ...secondTail], 960]]) {
    const rows = lines.map((line) => line.split(' ').map(Number)), n = rows[0][0];
    const graph = Array.from({ length: n + 1 }, () => []);
    for (let i = 1; i < n; i++) {
      const [a, b] = rows[i];
      graph[a].push([b, 1 << (i - 1)]);
      graph[b].push([a, 1 << (i - 1)]);
    }
    const paths = Array(n + 1);
    const visit = (v, parent, bits) => {
      paths[v] = bits;
      for (const [u, bit] of graph[v]) if (u !== parent) visit(u, v, bits | bit);
    };
    visit(1, 0, 0);
    assert.equal(rows.length, n + 1 + rows[n][0]);
    const constraints = rows.slice(n + 1).map(([a, b]) => paths[a] ^ paths[b]);
    let count = 0;
    for (let mask = 0; mask < 2 ** (n - 1); mask++) {
      if (constraints.every((path) => (path & mask) !== 0)) count++;
    }
    assert.equal(count, expected);
  }
});

test('fetches the requested physical statement pages only', () => {
  const item = catalog.search({ query: 'Mock-3 statements.pdf', scope: 'external' }).results[0];
  const result = catalog.fetch({ id: item.id, mode: 'H3', unit: 'page', start: 2, count: 2 });
  assert.match(result.metadata.location, /物理页 2–3/);
  assert.doesNotMatch(result.text, /物理页 4/);
});

test('withheld, unknown IDs and unsafe caller input are fail closed', () => {
  const withheld = catalog.search({ query: 'Basic-Algorithms_cjl', scope: 'external' }).results[0];
  assert.equal(catalog.fetch({ id: withheld.id, mode: 'H3' }).text, '');
  for (const args of [{ id: '../manifest.json', mode: 'H3' }, { id: 'missing', mode: 'H3' },
    { id: withheld.id, mode: 'H3', start: 0 }, { id: withheld.id, mode: 'H3', nope: 1 }]) {
    if (args.id === 'missing') assert.equal(catalog.fetch(args).metadata.access, 'not_found');
    else assert.throws(() => catalog.fetch(args), /invalid_argument/);
  }
});

test('cpp is returned by original line and only under H3', () => {
  const item = catalog.search({ query: 'BJTSC Day1 arcana.cpp', scope: 'external' }).results[0];
  const result = catalog.fetch({ id: item.id, mode: 'H3', unit: 'line', start: 1, count: 2 });
  assert.equal(result.text.split(/\r?\n/).length, 2);
  assert.match(result.text, /^#include<cstdio>/);
});

test('reads dynamically sized transcript fences without treating inner fences as the end', () => {
  const result = catalog.fetch({ id: 'wzj52501-b335630551682c19', mode: 'H3', unit: 'line', start: 28, count: 14 });
  assert.match(result.text, /```\n\.\n├── Lectures/);
  assert.match(result.text, /NOIP\/\s+National Olympiad/);
});

test('reports a missing external library separately from zero matches', (t) => {
  const temp = mkdtempSync(join(tmpdir(), 'xcpc-mcp-'));
  t.after(() => removeTemp(temp));
  mkdirSync(join(temp, '.agents/skills/xcpc-experience-coach/references/knowledge'), { recursive: true });
  cpSync(join(root, '.agents/skills/xcpc-experience-coach/references/knowledge'), join(temp, '.agents/skills/xcpc-experience-coach/references/knowledge'), { recursive: true });
  mkdirSync(join(temp, '.agents/skills/xcpc-experience-coach/references/knowledge/nested'));
  writeFileSync(join(temp, '.agents/skills/xcpc-experience-coach/references/knowledge/nested/nested-id.md'), '---\nkind: algorithm\ntopics: test\nevidence: single-case\nauthors: test\nstatus: active\nupdated: 2026-09-10\nrelated:\n---\n# Nested title\nbody\n', 'utf8');
  mkdirSync(join(temp, '.agents/skills/xcpc-experience-coach/references/knowledge/中文目录'));
  writeFileSync(join(temp, '.agents/skills/xcpc-experience-coach/references/knowledge/中文目录/cn-id.md'), '---\nkind: algorithm\ntopics: test\nevidence: single-case\nauthors: test\nstatus: active\nupdated: 2026-09-10\nrelated:\n---\n# 中文嵌套\n正文\n', 'utf8');
  execFileSync('git', ['init'], { cwd: temp });
  execFileSync('git', ['remote', 'add', 'origin', 'https://github.com/example/catalog.git'], { cwd: temp });
  execFileSync('git', ['add', '.'], { cwd: temp });
  execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'snapshot'], { cwd: temp });
  const local = loadCatalog(temp);
  assert.equal(local.externalAvailable, false);
  assert.match(local.search({ query: 'Nested title' }).results[0].url, /\/nested\/nested-id\.md#L10$/);
  const nested = local.search({ query: '中文嵌套' }).results[0];
  assert.match(nested.url, /%E4%B8%AD%E6%96%87%E7%9B%AE%E5%BD%95/);
  assert.equal(local.fetch({ id: nested.id, mode: 'H3', unit: 'line', start: 10, count: 3 }).text, '# 中文嵌套\n正文\n');
  assert.equal(local.search({ query: 'anything', scope: 'external' }).external_available, false);
  assert.equal(local.fetch({ id: 'wzj52501-0000000000000000', mode: 'H3' }).metadata.access, 'external_unavailable');
});

test('clamps default DOCX ranges, distinguishes empty units and rejects absent tables', () => {
  const id = 'wzj52501-e2940294a8c44755';
  const empty = catalog.fetch({ id, mode: 'H3', unit: 'paragraph', start: 5, count: 1 });
  assert.equal(empty.metadata.empty, true);
  assert.match(empty.text, /^段落 5\n$/);
  assert.match(catalog.fetch({ id, mode: 'H3', unit: 'paragraph', start: 32 }).metadata.location, /段落 32$/);
  assert.throws(() => catalog.fetch({ id, mode: 'H3', unit: 'table' }), /invalid_argument/);
});

test('rejects IDs that collide across association and external layers', (t) => {
  const temp = mkdtempSync(join(tmpdir(), 'xcpc-mcp-'));
  t.after(() => removeTemp(temp));
  const knowledge = join(temp, '.agents/skills/xcpc-experience-coach/references/knowledge');
  mkdirSync(knowledge, { recursive: true });
  writeFileSync(join(knowledge, 'wzj52501-bc37d034bad56458.md'), '---\nkind: algorithm\ntopics: test\nevidence: single-case\nauthors: test\nstatus: active\nupdated: 2026-09-10\nrelated:\n---\n# Collision\nbody\n', 'utf8');
  cpSync(join(root, 'sources'), join(temp, 'sources'), { recursive: true });
  execFileSync('git', ['init'], { cwd: temp });
  execFileSync('git', ['add', '.agents'], { cwd: temp });
  execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'snapshot'], { cwd: temp });
  assert.throws(() => loadCatalog(temp), /duplicate_id/);
});

test('rejects modified knowledge and invalid external manifests', (t) => {
  const temp = mkdtempSync(join(tmpdir(), 'xcpc-mcp-'));
  t.after(() => removeTemp(temp));
  const knowledge = join(temp, '.agents/skills/xcpc-experience-coach/references/knowledge');
  mkdirSync(knowledge, { recursive: true });
  cpSync(join(root, '.agents/skills/xcpc-experience-coach/references/knowledge'), knowledge, { recursive: true });
  execFileSync('git', ['init'], { cwd: temp });
  execFileSync('git', ['remote', 'add', 'origin', 'https://github.com/example/catalog.git'], { cwd: temp });
  execFileSync('git', ['add', '.'], { cwd: temp });
  execFileSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'snapshot'], { cwd: temp });
  writeFileSync(join(knowledge, 'changed.md'), 'x', 'utf8');
  assert.throws(() => loadCatalog(temp), /knowledge_snapshot_dirty/);
  rmSync(join(knowledge, 'changed.md'));
  mkdirSync(join(temp, 'sources/wzj52501'), { recursive: true });
  const manifest = JSON.parse(readFileSync(join(root, 'sources/wzj52501/manifest.json'), 'utf8'));
  manifest.entries[0].sha256 = '0'.repeat(64);
  writeFileSync(join(temp, 'sources/wzj52501/manifest.json'), JSON.stringify(manifest), 'utf8');
  assert.throws(() => loadCatalog(temp));
});
