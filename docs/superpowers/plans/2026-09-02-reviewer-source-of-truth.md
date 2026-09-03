# 审核记录事实来源修正实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除知识条目中的 `reviewers` 字段，把 GitHub PR 审批与合并历史确立为唯一审核记录。

**Architecture:** Frontmatter 只保存内容本身需要携带的作者和证据元数据；治理审计留在 GitHub。校验器拒绝遗留 `reviewers` 字段，三个示例与投稿文档同步迁移，不增加机器人或回填流程。

**Tech Stack:** Markdown、Node.js 22 标准库、`node:test`、GitHub Pull Request/CODEOWNERS。

## Global Constraints

- `authors` 继续必填，并使用 GitHub `@用户名`。
- 不新增 `approved_by`、`merged_by` 或其他审核身份字段。
- 不增加合并后回填 Action、机器人提交或新依赖。
- 分支保护与审批数量继续由 GitHub 仓库规则配置，不在本次代码中实现。

---

### Task 1: 修改 Schema 校验并迁移示例

**Files:**
- Modify: `tests/validate.test.mjs`
- Modify: `scripts/validate.mjs`
- Modify: `.agents/skills/xcpc-experience-coach/references/contribution-schema.md`
- Modify: `.agents/skills/xcpc-experience-coach/references/knowledge/20260902-example-member-contest-switching.md`
- Modify: `.agents/skills/xcpc-experience-coach/references/knowledge/20260902-example-member-shortest-path-checklist.md`
- Modify: `.agents/skills/xcpc-experience-coach/references/knowledge/20260902-example-member-transfer-training.md`

**Interfaces:**
- Consumes: Frontmatter 文本及 `validate(content, filename)` 测试辅助函数。
- Produces: 不含 `reviewers` 的条目契约；`reviewers` 作为未知字段被拒绝；`authors` 仍必须为一个或多个 GitHub 用户名。

- [ ] **Step 1: 先修改测试数据，使合法条目不再包含 `reviewers`**

在 `entry()` 的字段对象和 Frontmatter 模板中删除：

```js
reviewers: '"@bob"',
```

```yaml
reviewers: ${fields.reviewers}
```

把第一个测试名称改为：

```js
test("accepts a valid entry without reviewers", () => {
  const result = validate(entry());
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
```

- [ ] **Step 2: 用失败测试定义作者和遗留字段行为**

删除旧的 `rejects author-only review` 测试，加入：

```js
test("rejects missing authors", () => {
  const result = validate(entry({ authors: "" }));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /缺少字段：authors/);
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
```

- [ ] **Step 3: 运行测试并确认 RED**

Run:

```powershell
node --test tests\validate.test.mjs
```

Expected: `accepts a valid entry without reviewers` 失败，因为当前校验器仍要求 `reviewers`；遗留字段测试也不满足预期。

- [ ] **Step 4: 最小修改校验器**

在 `scripts/validate.mjs` 中把字段集合改为：

```js
const allowedFields = new Set(["kind", "topics", "evidence", "authors", "status", "updated", "related"]);
const requiredFields = ["kind", "topics", "evidence", "authors", "status", "updated"];
```

用仅校验作者的逻辑替换原作者/审核者关系校验：

```js
const authors = list(fields.authors ?? "");
if (authors.some((user) => !/^@[A-Za-z0-9-]+$/.test(user))) {
  errors.push("authors 必须使用 GitHub @用户名");
}
```

- [ ] **Step 5: 运行测试并确认 GREEN**

Run:

```powershell
node --test tests\validate.test.mjs
```

Expected: 7 tests pass，0 fail。

- [ ] **Step 6: 迁移 Schema 与三个示例**

在 `contribution-schema.md` 的 Frontmatter 示例中删除：

```yaml
reviewers: "@senior"
```

把字段说明改为：

```markdown
- `topics`、`authors` 可用英文逗号分隔多项
- `authors` 至少包含一位投稿者，并使用 GitHub `@用户名`
- 审核人与合并人不写入条目，以 GitHub PR review 和 merge history 为准
```

从三个知识示例的 Frontmatter 中分别删除：

```yaml
reviewers: "@example-reviewer"
```

- [ ] **Step 7: 验证整个知识目录**

Run:

```powershell
npm test
npm run validate
```

Expected: 7 tests pass；输出 `Validated 5 knowledge entries.`。

- [ ] **Step 8: 提交 Task 1**

```powershell
git add tests\validate.test.mjs scripts\validate.mjs .agents\skills\xcpc-experience-coach\references
git commit -m "fix: use PR history for review records"
```

---

### Task 2: 同步投稿说明并完成验证

**Files:**
- Modify: `.github/pull_request_template.md`
- Modify: `docs/usage.md`

**Interfaces:**
- Consumes: Task 1 产生的不含 `reviewers` 的投稿 Schema。
- Produces: 投稿者只填写内容与作者信息、审核身份由 GitHub 自动留痕的用户说明。

- [ ] **Step 1: 更新 PR 模板**

在 `.github/pull_request_template.md` 的“自检”列表加入：

```markdown
- [ ] 条目未填写 `reviewers`；审核人与合并人由 GitHub PR 自动留痕
```

- [ ] **Step 2: 更新使用指南**

在 `docs/usage.md` 的投稿步骤中，在“发起 Pull Request”之后补充：

```markdown
投稿者不填写 `reviewers`。实际审核人和合并人以 GitHub PR 的 review 与 merge history 为准。
```

- [ ] **Step 3: 执行最终验证**

Run:

```powershell
npm test
npm run validate
python -X utf8 C:\Users\Lenovo\.codex\skills\.system\skill-creator\scripts\quick_validate.py .agents\skills\xcpc-experience-coach
git diff --check
```

Expected:

- 7 tests pass，0 fail；
- `Validated 5 knowledge entries.`；
- `Skill is valid!`；
- `git diff --check` 无输出且退出码为 0。

- [ ] **Step 4: 检查遗留引用**

Run:

```powershell
rg -n "reviewers|example-reviewer|author-only review" .agents scripts tests docs .github
```

Expected: 只命中明确说明“不要填写 `reviewers`”或“遗留 `reviewers` 会被拒绝”的文档和测试；Schema 示例、知识示例及校验器字段列表中不再出现该字段。

- [ ] **Step 5: 提交 Task 2**

```powershell
git add .github\pull_request_template.md docs\usage.md
git commit -m "docs: clarify GitHub-owned review records"
```
