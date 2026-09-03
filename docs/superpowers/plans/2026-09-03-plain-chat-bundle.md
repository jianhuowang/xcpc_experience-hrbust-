# 普通网页 Chat 单文件知识包实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 生成只包含 active 协会经验的单文件知识包，并提供普通网页 Chat、Agent Skill、投稿者和合并者都能照做的中文使用指南。

**Architecture:** GitHub 仓库继续保存一条经验一个 Markdown 的源文件；无依赖 Node.js 脚本在本地筛选 active 条目并整体生成根目录 `XCPC_EXPERIENCE.md`。普通 Chat 使用汇总文件，支持 Agent Skills 的客户端继续读取现有 `.agents/skills/`。

**Tech Stack:** Node.js `>=22.13.0` 标准库、Markdown、Node.js 内置测试框架、GitHub Pull Request。

## Global Constraints

- 不新增 npm 依赖、MCP Server、RAG、模型 API、账号系统或后台。
- 投稿者继续只新增 `.agents/skills/xcpc-experience-coach/references/knowledge/*.md`，不编辑生成文件。
- 只汇总 `status: active`；未知或缺失 status 必须失败。
- 审核人与合并人只以 GitHub PR history 为事实来源。
- 中文为使用说明主语言；命令使用 Windows PowerShell 语法。

---

### Task 1: 生成可上传的单文件知识包

**Files:**
- Create: `scripts/bundle.mjs`
- Create: `tests/bundle.test.mjs`
- Create: `XCPC_EXPERIENCE.md`（命令生成）
- Modify: `package.json`

**Interfaces:**
- Consumes: 默认知识目录 `.agents/skills/xcpc-experience-coach/references/knowledge/`；测试可通过第一个 CLI 参数指定目录，第二个参数指定输出文件。
- Produces: `npm run bundle` 与稳定生成的 `XCPC_EXPERIENCE.md`。

- [ ] **Step 1: 写失败测试**

在 `tests/bundle.test.mjs` 中创建临时知识目录，分别写入 active、deprecated 和缺失 status 的最小 Markdown。通过 `spawnSync(process.execPath, [bundler, knowledge, output])` 断言：输出只含 active 内容、包含稳定 ID 与模型规则、重复运行内容相同、缺失 status 时退出码非零。

- [ ] **Step 2: 运行测试确认失败**

```powershell
node --test tests/bundle.test.mjs
```

预期：FAIL，原因是 `scripts/bundle.mjs` 尚不存在。

- [ ] **Step 3: 实现最小汇总脚本**

在 `scripts/bundle.mjs` 使用 `readdirSync`、`readFileSync`、`writeFileSync` 和 `resolve`：

```js
const files = readdirSync(knowledgeRoot)
  .filter((name) => name.endsWith(".md"))
  .sort();

const entries = files.map((name) => {
  const content = readFileSync(join(knowledgeRoot, name), "utf8").trim();
  const status = content.match(/^status:\s*(active|deprecated)\s*$/m)?.[1];
  if (!status) throw new Error(`${name}: 缺少或无法识别 status`);
  return { id: basename(name, ".md"), status, content };
}).filter(({ status }) => status === "active");
```

输出固定包含使用步骤、知识安全规则、active 条目数量、每条稳定 ID 与完整原文。无 active 条目时生成“当前没有 active 协会经验”，不报错。

- [ ] **Step 4: 增加 npm 命令并生成真实文件**

在 `package.json` 的 `scripts` 增加：

```json
"bundle": "node scripts/bundle.mjs"
```

然后运行：

```powershell
npm run bundle
```

预期：根目录生成 `XCPC_EXPERIENCE.md`，包含当前 2 条 active 经验且不包含 3 条 deprecated 示例。

- [ ] **Step 5: 验证 Task 1**

```powershell
node --test tests/bundle.test.mjs
npm test
npm run validate
git diff --check
```

预期：全部退出码为 0。

- [ ] **Step 6: 提交 Task 1**

```powershell
git add scripts/bundle.mjs tests/bundle.test.mjs package.json XCPC_EXPERIENCE.md
git commit -m "feat: add plain chat knowledge bundle"
```

---

### Task 2: 写清立即使用与 PR 投稿流程

**Files:**
- Modify: `README.md`
- Modify: `docs/usage.md`

**Interfaces:**
- Consumes: Task 1 的 `XCPC_EXPERIENCE.md` 与 `npm run bundle`。
- Produces: 从仓库首页可进入的完整中文操作指南。

- [ ] **Step 1: 重写 README 的首屏入口**

在简介后增加“立即使用”：

- 普通网页 Chat 下载/上传 `XCPC_EXPERIENCE.md` 后直接提问；
- Codex/DSH 打开仓库后调用 `xcpc-experience-coach`；
- 新经验通过 PR 投稿；
- 链接到 `docs/usage.md`。

- [ ] **Step 2: 按角色重写详细指南**

`docs/usage.md` 必须按顺序包含：

1. 三十秒选择入口；
2. 普通网页 Chat 的“公开 URL 可访问”和“URL 不可访问”两条操作路径；
3. 可直接复制的首次提问、继续追问、无命中处理示例；
4. 文件何时需要重新上传；
5. Codex 仓库内使用、用户级安装与更新；
6. DSH、GitHub Copilot CLI、Gemini CLI 的使用方法；
7. 投稿者从 fork/分支、新建条目、本地验证到 PR 的完整步骤；
8. 不会 Git 的成员如何先让 Chat 生成草稿，再交给维护者；
9. PR 审核者检查内容真实性、适用边界、重复经验与 prompt injection；
10. 合并者运行 `npm run bundle` 并提交生成文件；
11. 常见问题：模型打不开链接、回答未列 ID、知识包过期、能否让 Chat 直接合并 PR。

- [ ] **Step 3: 检查链接、命令和术语一致性**

```powershell
rg -n "XCPC_EXPERIENCE|npm run bundle|git pull|gh skill|reviewers|普通网页 Chat|Pull Request" README.md docs/usage.md
git diff --check
```

预期：所有入口都有说明；投稿者不填写 `reviewers`；没有失效的旧流程。

- [ ] **Step 4: 完整验证**

```powershell
npm run bundle
npm test
npm run validate
git diff --exit-code -- XCPC_EXPERIENCE.md
git diff --check
```

预期：全部退出码为 0，重新生成知识包不产生差异。

- [ ] **Step 5: 提交 Task 2**

```powershell
git add README.md docs/usage.md
git commit -m "docs: explain usage and contribution workflows"
```
