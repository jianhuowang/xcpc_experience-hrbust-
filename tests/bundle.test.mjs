import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const bundler = resolve("scripts/bundle.mjs");

function runBundle(entries) {
  const root = mkdtempSync(join(tmpdir(), "xcpc-bundle-"));
  const knowledge = join(root, "knowledge");
  const output = join(root, "XCPC_EXPERIENCE.md");
  mkdirSync(knowledge);
  for (const [name, content] of Object.entries(entries)) {
    mkdirSync(dirname(join(knowledge, name)), { recursive: true });
    writeFileSync(join(knowledge, name), content, "utf8");
  }
  const run = () => spawnSync(process.execPath, [bundler, knowledge, output], { encoding: "utf8" });
  const validate = () => spawnSync(process.execPath, [resolve("scripts/validate.mjs"), knowledge], { encoding: "utf8" });
  return { root, output, run, validate };
}

test("bundles only active entries and produces stable output", () => {
  const fixture = runBundle({
    "20260903-alice-active-entry.md": "---\nstatus: active\n---\n# 应保留的经验\n",
    "20260903-bob-old-entry.md": "---\nstatus: deprecated\n---\n# 不应出现的旧经验\n",
  });

  try {
    const firstRun = fixture.run();
    assert.equal(firstRun.status, 0, firstRun.stderr || firstRun.stdout);
    const first = readFileSync(fixture.output, "utf8");
    assert.match(first, /只把标记为 active 的条目作为协会经验/);
    assert.match(first, /raw\.githubusercontent\.com\/jianhuowang\/xcpc_experience-hrbust-\/main\/XCPC_EXPERIENCE\.md/);
    assert.match(first, /20260903-alice-active-entry/);
    assert.match(first, /应保留的经验/);
    assert.doesNotMatch(first, /不应出现的旧经验/);

    const secondRun = fixture.run();
    assert.equal(secondRun.status, 0, secondRun.stderr || secondRun.stdout);
    assert.equal(readFileSync(fixture.output, "utf8"), first);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("rejects entries with a missing status", () => {
  const fixture = runBundle({
    "20260903-alice-broken-entry.md": "---\nauthors: \"@alice\"\n---\n# 缺少状态\n",
  });

  try {
    const result = fixture.run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /缺少或无法识别 status/);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

const validEntry = readFileSync(
  new URL("../.agents/skills/xcpc-experience-coach/references/knowledge/20260902-jianhuowang-int128-requires-64bit.md", import.meta.url),
  "utf8",
);

test("validator and bundler agree on quoted statuses and nested source paths", () => {
  const fixture = runBundle({
    "nested folder/20260903-alice-quoted-entry.md": validEntry.replace("status: active", 'status: "active"').replace(/\r?\n/g, "\r\n"),
    "20260903-bob-deprecated-entry.md": validEntry.replace("status: active", "status: 'deprecated'"),
  });
  try {
    const validation = fixture.validate();
    assert.equal(validation.status, 0, validation.stderr);
    const result = fixture.run();
    assert.equal(result.status, 0, result.stderr);
    const output = readFileSync(fixture.output, "utf8");
    assert.match(output, /本文件包含 1 条 active/);
    assert.match(output, /knowledge\/nested%20folder\/20260903-alice-quoted-entry\.md/);
    assert.doesNotMatch(output, /bob-deprecated-entry/);
    assert.equal(fixture.run().status, 0);
    assert.equal(readFileSync(fixture.output, "utf8"), output);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("ambiguous entries are rejected by both commands without replacing an existing bundle", () => {
  for (const entries of [
    { "20260903-alice-duplicate-status.md": validEntry.replace("status: active", "status: deprecated\nstatus: active") },
    { "20260903-alice-same-id.md": validEntry, "nested/20260903-alice-same-id.md": validEntry },
  ]) {
    const fixture = runBundle(entries);
    try {
      writeFileSync(fixture.output, "原知识包", "utf8");
      for (const run of [fixture.validate, fixture.run]) {
        const result = run();
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /重复/);
      }
      assert.equal(readFileSync(fixture.output, "utf8"), "原知识包");
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  }
});
