import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const bundler = resolve("scripts/bundle.mjs");

function runBundle(entries) {
  const root = mkdtempSync(join(tmpdir(), "xcpc-bundle-"));
  const knowledge = join(root, "knowledge");
  const output = join(root, "XCPC_EXPERIENCE.md");
  mkdirSync(knowledge);
  for (const [name, content] of Object.entries(entries)) {
    writeFileSync(join(knowledge, name), content, "utf8");
  }
  const run = () => spawnSync(process.execPath, [bundler, knowledge, output], { encoding: "utf8" });
  return { root, output, run };
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
