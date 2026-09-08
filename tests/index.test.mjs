import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const generator = resolve("scripts/build-index.mjs");
const source = readFileSync(resolve(".agents/skills/xcpc-experience-coach/references/knowledge/20260902-jianhuowang-int128-requires-64bit.md"), "utf8");

function fixture(entries) {
  const root = mkdtempSync(join(tmpdir(), "xcpc-index-"));
  const knowledge = join(root, "knowledge");
  const output = join(root, "knowledge-index.md");
  mkdirSync(knowledge);
  for (const [name, content] of Object.entries(entries)) {
    const path = join(knowledge, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf8");
  }
  return { root, output, run: () => spawnSync(process.execPath, [generator, knowledge, output], { encoding: "utf8" }) };
}

test("generates a deterministic index grouped by status, kind and topic with working nested links", () => {
  const data = fixture({
    "中文 folder)/20260908-alice-active-entry.md": source.replace(/^# .+$/m, "# 标题 [链接](https://example.com) | <script>").replace(/\r?\n/g, "\r\n"),
    "20260908-bob-history-entry.md": source.replace("status: active", 'status: "deprecated"'),
  });
  try {
    const result = data.run();
    assert.equal(result.status, 0, result.stderr);
    const output = readFileSync(data.output, "utf8");
    for (const heading of ["## 按状态", "### active", "### deprecated", "## 按类型", "### debugging", "## 按主题", "### integer"]) {
      assert.ok(output.includes(heading), heading);
    }
    assert.match(output, /2 条.*1 条 active.*1 条 deprecated/);
    assert.ok(output.includes("knowledge/%E4%B8%AD%E6%96%87%20folder%29/20260908-alice-active-entry.md"));
    assert.match(output, /20260908-bob-history-entry/);
    for (const [, link] of output.matchAll(/\]\(([^)]+)\)/g)) {
      assert.ok(existsSync(resolve(dirname(data.output), decodeURIComponent(link))), link);
    }
    assert.doesNotMatch(output, /<script>|\[链接\]\(https:/);
    assert.equal(data.run().status, 0);
    assert.equal(readFileSync(data.output, "utf8"), output);
  } finally {
    rmSync(data.root, { recursive: true, force: true });
  }
});

test("empty knowledge directory produces an explicit empty index", () => {
  const data = fixture({});
  try {
    const result = data.run();
    assert.equal(result.status, 0, result.stderr);
    assert.match(readFileSync(data.output, "utf8"), /当前没有知识条目/);
  } finally {
    rmSync(data.root, { recursive: true, force: true });
  }
});

test("invalid metadata or duplicate IDs do not overwrite the previous index", () => {
  for (const entries of [
    { "20260908-alice-broken-entry.md": "没有 Frontmatter" },
    { "20260908-alice-broken-entry.md": source.replace("status: active", "status: draft") },
    { "20260908-alice-broken-entry.md": source.replace("kind: debugging", "kind:") },
    { "20260908-alice-broken-entry.md": source.replace("kind: debugging", "kind: nonsense") },
    { "20260908-alice-broken-entry.md": source.replace("topics: debugging, environment, integer", "topics: ,") },
    { "20260908-alice-same-id.md": source, "nested/20260908-alice-same-id.md": source },
  ]) {
    const data = fixture(entries);
    try {
      writeFileSync(data.output, "旧索引", "utf8");
      const result = data.run();
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Frontmatter|status|kind|topics|重复.*ID/);
      assert.equal(readFileSync(data.output, "utf8"), "旧索引");
    } finally {
      rmSync(data.root, { recursive: true, force: true });
    }
  }
});
