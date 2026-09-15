import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const validator = resolve("scripts/validate.mjs");

function entry(overrides = {}) {
  const fields = {
    kind: "algorithm",
    topics: "graph, shortest-path",
    evidence: "source-backed",
    authors: '"@alice"',
    status: "active",
    updated: "2026-09-02",
    related: "",
    ...overrides,
  };

  return `---
kind: ${fields.kind}
topics: ${fields.topics}
evidence: ${fields.evidence}
authors: ${fields.authors}
status: ${fields.status}
updated: ${fields.updated}
related: ${fields.related}
---
# 最短路经验

## 经验结论
结论。
## 适用信号
信号。
## 常见 blocker 或失败症状
症状。
## 原因与原理
原理。
## 验证方式
验证。
## 边界与反例
边界。
## 来源
https://example.com/problem
## 核心模型或不变量
不变量。
## 复杂度与约束
复杂度。
## 实现风险
风险。
## 迁移识别
迁移。
`;
}

function validate(content, extraEntries = {}) {
  const root = mkdtempSync(join(tmpdir(), "xcpc-knowledge-"));
  const knowledge = join(root, "knowledge");
  mkdirSync(knowledge);
  for (const [name, text] of Object.entries({ "20260902-alice-shortest-path.md": content, ...extraEntries })) {
    mkdirSync(dirname(join(knowledge, name)), { recursive: true });
    writeFileSync(join(knowledge, name), text, "utf8");
  }
  const result = spawnSync(process.execPath, [validator, knowledge], { encoding: "utf8" });
  rmSync(root, { recursive: true, force: true });
  return result;
}

test("accepts a valid entry without reviewers", () => {
  const result = validate(entry());
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("topic IDs coexist with legacy IDs and preserve related validation", () => {
  const topic = "trie-lcp-count-contribution";
  const legacy = "20260902-alice-shortest-path";
  const result = validate(entry({ related: topic }), {
    [`${topic}.md`]: entry({ status: "deprecated", related: legacy }),
  });
  assert.equal(result.status, 0, result.stderr);
  for (const related of [topic, "missing-topic"]) {
    const invalid = validate(entry(), { [`${topic}.md`]: entry({ status: "deprecated", related }) });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /related.*(自身|不存在)/);
  }
  for (const name of ["Trie-LCP", "trie_lcp", "-trie", "trie--lcp"]) {
    const invalid = validate(entry(), { [`${name}.md`]: entry({ status: "deprecated" }) });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /文件名/);
  }
});

test("published drafting skeleton requires completion and matches the real validator", () => {
  const schema = readFileSync('.agents/skills/xcpc-experience-coach/references/contribution-schema.md', 'utf8');
  const template = schema.match(/```markdown\r?\n(---\r?\n[\s\S]*?)\r?\n```/)[1] + '\n';
  const blank = validate(template);
  assert.notEqual(blank.status, 0);
  assert.match(blank.stderr, /缺少字段：authors/);
  assert.match(blank.stderr, /缺少字段：updated/);
  const filled = template.replace(/^authors:[^\r\n]*/m, 'authors: "@alice"')
    .replace(/^updated:[^\r\n]*/m, 'updated: 2026-09-15')
    .replace(/待补充：[^\r\n]*/g, '仅用于验证模板与校验器契约的测试内容。');
  const missingSource = filled.replace(/(## 来源\r?\n)[\s\S]*?(?=## )/, '$1\n');
  const incomplete = validate(missingSource);
  assert.notEqual(incomplete.status, 0);
  assert.match(incomplete.stderr, /缺少内容：## 来源/);
  const completed = missingSource.replace('## 来源', '## 来源\nhttps://example.org/test-fixture');
  const result = validate(completed);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("rejects an unknown kind", () => {
  const result = validate(entry({ kind: "solution" }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /kind/);
});

test("rejects missing authors", () => {
  const result = validate(entry({ authors: "" }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /缺少字段：authors/);
});

test("rejects an empty author list", () => {
  const result = validate(entry({ authors: "," }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /authors 必须使用 GitHub @用户名/);
});

test("rejects the legacy reviewers field", () => {
  const content = entry().replace(
    'authors: "@alice"\n',
    'authors: "@alice"\nreviewers: "@bob"\n',
  );
  const result = validate(content);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /未知字段：reviewers/);
});

test("rejects missing type-specific headings", () => {
  const content = entry().replace("## 复杂度与约束\n复杂度。\n", "");
  const result = validate(content);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /复杂度与约束/);
});

test("rejects non-HTTPS external sources", () => {
  const content = entry().replace("https://example.com/problem", "http://example.com/problem");
  const result = validate(content);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /HTTPS/);
});

test("related accepts an existing entry in a subdirectory, including deprecated history", () => {
  const result = validate(entry({ related: "20260902-bob-old-model" }), {
    "history/20260902-bob-old-model.md": entry({ status: "deprecated" }),
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("related rejects missing targets and self-references", () => {
  for (const related of ["20260902-bob-missing-model", "20260902-alice-shortest-path"]) {
    const result = validate(entry({ related }));
    assert.notEqual(result.status, 0, related);
    assert.match(result.stderr, /related.*(不存在|自身)/);
  }
});

test("topics rejects invalid, duplicate and empty items", () => {
  for (const topics of ["Graph", "shortest_path", "graph--tree", "graph, graph", "graph,,tree", "graph,"]) {
    const result = validate(entry({ topics }));
    assert.notEqual(result.status, 0, topics);
    assert.match(result.stderr, /topics/);
  }
});

test("active required sections reject template placeholders", () => {
  for (const placeholder of ["TODO: 补证据", "TBD", "待补充", "替换为实际内容"]) {
    for (const original of ["结论。", "复杂度。", "迁移。"]) {
      const result = validate(entry().replace(original, placeholder));
      assert.notEqual(result.status, 0, `${original}: ${placeholder}`);
      assert.match(result.stderr, /占位/);
    }
  }
});

test("deprecated placeholders and non-placeholder discussions stay valid", () => {
  for (const content of [
    entry({ status: "deprecated" }).replace("复杂度。", "替换为实际内容"),
    entry().replace("结论。", "检查 TODO 注释以确认没有漏实现。"),
  ]) {
    const result = validate(content);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }
});

test("duplicate stable IDs across directories are rejected", () => {
  const result = validate(entry(), { "nested/20260902-alice-shortest-path.md": entry() });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /重复.*ID/);
});

test("duplicate frontmatter fields are rejected", () => {
  const result = validate(entry().replace("status: active", "status: deprecated\nstatus: active"));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /重复.*status/);
});

test("rejects copied active bodies despite metadata, title and newline changes", () => {
  for (const copy of [
    entry(),
    entry({ authors: '"@bob"', topics: "graph", updated: "2026-09-08" })
      .replace("# 最短路经验", "\n# 换一个标题")
      .replace(/\r?\n/g, "\r\n") + "\r\n",
  ]) {
    const result = validate(entry(), { "nested/20260908-bob-copied-entry.md": copy });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /正文重复/);
    assert.match(result.stderr, /20260902-alice-shortest-path/);
    assert.match(result.stderr, /20260908-bob-copied-entry/);
  }
});

test("preserves evidence, numeric boundaries, case and code indentation when comparing bodies", () => {
  const original = entry().replace("原理。", "条件 X < 10。\n\n```python\nif X:\n    run()\n# comment\n```");
  for (const changed of [
    original.replace("10", "11"),
    original.replace("X <", "x <"),
    original.replace("    run()", "run()"),
    original.replace("# comment", "# different comment"),
    original.replace("验证。", "验证。补充新的复现记录。"),
    original.replace("https://example.com/problem", "https://example.com/another-source"),
  ]) {
    const result = validate(original, { "20260908-bob-related-entry.md": changed });
    assert.equal(result.status, 0, result.stderr);
  }
});

test("retains identical deprecated history without rejecting the active replacement", () => {
  const result = validate(entry({ status: "deprecated" }), {
    "20260908-bob-active-entry.md": entry(),
    "history/20260908-bob-old-entry.md": entry({ status: "deprecated" }),
  });
  assert.equal(result.status, 0, result.stderr);
});
