import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const artifacts = [
  '.agents/skills/xcpc-experience-coach/references/knowledge-index.md',
  'XCPC_EXPERIENCE.md',
];

function run(cwd, command, args, allowFailure = false) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}${result.stderr}`);
  }
  return result;
}

function prepareKnowledge(cwd) {
  // 通过 npm run 调用，复用 npm 的实际 CLI 路径，兼容 Windows npm.cmd。
  if (!process.env.npm_execpath) throw new Error('Run via npm run publish:knowledge');
  for (const args of [
    ['ci'], ['run', 'validate'], ['run', 'build-index'], ['run', 'bundle'],
    ['test'], ['run', 'validate:library'],
  ]) {
    const result = run(cwd, process.execPath, [process.env.npm_execpath, ...args]);
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
  }
}

// 只用于独立的 Actions checkout；拒绝带有未提交工作的目录，不 reset 或强推。
export function publishKnowledge({ cwd = process.cwd(), prepare = prepareKnowledge } = {}) {
  const git = (...args) => run(cwd, 'git', args).stdout.trim();
  if (git('status', '--porcelain')) throw new Error('Publishing requires a clean checkout');

  for (let attempt = 1; attempt <= 3; attempt++) {
    git('fetch', 'origin', 'main');
    const base = git('rev-parse', 'refs/remotes/origin/main');
    git('checkout', '--detach', base);
    prepare(cwd);

    // 生成/测试即使意外改了源文件也不得发布；允许变更的只有两个产物。
    const changed = git('diff', '--name-only', 'HEAD').split('\n').filter(Boolean);
    const untracked = git('ls-files', '--others', '--exclude-standard');
    if (untracked || changed.some((path) => !artifacts.includes(path))) {
      throw new Error('Generation changed files outside the artifact allowlist');
    }
    if (!changed.length) {
      console.log('Knowledge artifacts are already up to date.');
      return { published: false, attempts: attempt };
    }
    git('add', '--', ...artifacts);
    git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
      'commit', '-m', 'docs: refresh knowledge index and bundle');
    const push = run(cwd, 'git', ['push', 'origin', 'HEAD:refs/heads/main'], true);
    if (push.status === 0) {
      console.log(push.stderr);
      return { published: true, attempts: attempt };
    }
    git('fetch', 'origin', 'main');
    if (git('rev-parse', 'refs/remotes/origin/main') === base) {
      throw new Error(`Publish rejected; check branch rules or token permissions.\n${push.stderr}`);
    }
    console.log('main advanced during publication; regenerate and revalidate its latest revision.');
  }
  throw new Error('main kept advancing; rerun the workflow to publish the latest artifacts');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.GITHUB_REF !== 'refs/heads/main'
    || !['push', 'workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME)) {
    throw new Error('Automatic publication is only allowed in Actions on main');
  }
  publishKnowledge();
}
