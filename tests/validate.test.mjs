import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const validator = resolve("scripts/validate.mjs");

function entry(overrides = {}) {
  const fields = {
    kind: "algorithm",
    topics: "graph, shortest-path",
    evidence: "source-backed",
    authors: '"@alice"',
    reviewers: '"@bob"',
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
reviewers: ${fields.reviewers}
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

function validate(content, filename = "20260902-alice-shortest-path.md") {
  const root = mkdtempSync(join(tmpdir(), "xcpc-knowledge-"));
  const knowledge = join(root, "knowledge");
  mkdirSync(knowledge);
  writeFileSync(join(knowledge, filename), content, "utf8");
  const result = spawnSync(process.execPath, [validator, knowledge], { encoding: "utf8" });
  rmSync(root, { recursive: true, force: true });
  return result;
}

test("accepts a valid algorithm entry", () => {
  const result = validate(entry());
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("rejects an unknown kind", () => {
  const result = validate(entry({ kind: "solution" }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /kind/);
});

test("rejects author-only review", () => {
  const result = validate(entry({ reviewers: '"@alice"' }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /reviewer/i);
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
