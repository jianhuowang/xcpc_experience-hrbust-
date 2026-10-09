import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { artifacts, publishKnowledge } from '../scripts/publish-knowledge.mjs';

const project = resolve('.');
const knowledge = '.agents/skills/xcpc-experience-coach/references/knowledge';
const sample = readFileSync(join(project, knowledge, '20260902-jianhuowang-int128-requires-64bit.md'), 'utf8');
const second = readFileSync(join(project, knowledge, '20260902-jianhuowang-abc221e-leq.md'), 'utf8');

function command(cwd, program, args) {
  const result = spawnSync(program, args, { cwd, encoding: 'utf8', env: {
    ...process.env, GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.com',
  } });
  assert.equal(result.status, 0, `${program} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'xcpc-publish-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const seed = join(root, 'seed');
  const remote = join(root, 'remote.git');
  const worker = join(root, 'worker');
  mkdirSync(seed);
  const git = (cwd, ...args) => command(cwd, 'git', args);
  git(root, 'init', '--bare', '--initial-branch=main', remote);
  git(seed, 'init', '--initial-branch=main');
  mkdirSync(join(seed, knowledge), { recursive: true });
  mkdirSync(join(seed, 'scripts'));
  for (const file of ['knowledge.mjs', 'validate.mjs', 'build-index.mjs', 'bundle.mjs']) {
    copyFileSync(join(project, 'scripts', file), join(seed, 'scripts', file));
  }
  writeFileSync(join(seed, knowledge, 'sample.md'), sample);
  for (const file of artifacts) writeFileSync(join(seed, file), 'stale\n');
  git(seed, 'add', '.');
  git(seed, 'commit', '-m', 'initial source with stale artifacts');
  git(seed, 'remote', 'add', 'origin', remote);
  git(seed, 'push', '-u', 'origin', 'main');
  git(root, 'clone', remote, worker);
  const prepare = (cwd) => {
    for (const script of ['validate.mjs', 'build-index.mjs', 'bundle.mjs']) {
      command(cwd, process.execPath, [join(cwd, 'scripts', script)]);
    }
  };
  const head = () => git(root, '--git-dir', remote, 'rev-parse', 'main');
  const artifact = (file) => git(root, '--git-dir', remote, 'show', `main:${file}`);
  return { root, seed, worker, git, prepare, head, artifact };
}

test('publishes only generated files, skips unchanged output and removes deprecated entries from bundle', (t) => {
  const f = fixture(t);
  const before = f.head();
  assert.deepEqual(publishKnowledge({ cwd: f.worker, prepare: f.prepare }), { published: true, attempts: 1 });
  assert.notEqual(f.head(), before);
  assert.deepEqual(f.git(f.worker, 'diff', '--name-only', before, 'HEAD').split('\n').sort(), [...artifacts].sort());
  assert.match(f.artifact(artifacts[0]), /1 条 active/);
  assert.match(f.artifact(artifacts[1]), /BEGIN KNOWLEDGE ENTRY: sample/);
  const published = f.head();
  assert.equal(publishKnowledge({ cwd: f.worker, prepare: f.prepare }).published, false);
  assert.equal(f.head(), published);

  f.git(f.seed, 'pull', '--ff-only');
  writeFileSync(join(f.seed, knowledge, 'sample.md'), sample.replace('status: active', 'status: deprecated'));
  f.git(f.seed, 'commit', '-am', 'deprecate sample');
  f.git(f.seed, 'push', 'origin', 'main');
  publishKnowledge({ cwd: f.worker, prepare: f.prepare });
  assert.match(f.artifact(artifacts[0]), /0 条 active、1 条 deprecated/);
  assert.doesNotMatch(f.artifact(artifacts[1]), /BEGIN KNOWLEDGE ENTRY: sample/);
});

test('rebuilds from latest main after a racing source commit without overwriting it', (t) => {
  const f = fixture(t);
  let prepared = 0;
  const result = publishKnowledge({ cwd: f.worker, prepare: (cwd) => {
    f.prepare(cwd);
    if (++prepared === 1) {
      writeFileSync(join(f.seed, knowledge, 'second.md'), second);
      f.git(f.seed, 'add', '.');
      f.git(f.seed, 'commit', '-m', 'concurrent second experience');
      f.git(f.seed, 'push', 'origin', 'main');
    }
  } });
  assert.deepEqual(result, { published: true, attempts: 2 });
  assert.match(f.artifact(artifacts[1]), /BEGIN KNOWLEDGE ENTRY: second/);
  assert.match(f.artifact(artifacts[0]), /2 条 active/);
});

test('failed validation and unexpected source edits never publish', (t) => {
  const f = fixture(t);
  const before = f.head();
  assert.throws(() => publishKnowledge({ cwd: f.worker, prepare: () => { throw new Error('validation failed'); } }), /validation failed/);
  assert.equal(f.head(), before);
  assert.throws(() => publishKnowledge({ cwd: f.worker, prepare: (cwd) => {
    f.prepare(cwd);
    writeFileSync(join(cwd, knowledge, 'sample.md'), `${sample}\nUnexpected source edit\n`);
  } }), /outside the artifact allowlist/);
  assert.equal(f.head(), before);
  assert.throws(() => publishKnowledge({ cwd: f.worker, prepare: f.prepare }), /clean checkout/);
});

test('publication CLI refuses pull request events even when running in Actions', () => {
  const result = spawnSync(process.execPath, [join(project, 'scripts/publish-knowledge.mjs')], {
    encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: 'true', GITHUB_REF: 'refs/heads/main', GITHUB_EVENT_NAME: 'pull_request' },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /only allowed in Actions on main/);
});
