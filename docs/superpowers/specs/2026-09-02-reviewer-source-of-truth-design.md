# 审核记录事实来源修正

## 问题

当前投稿 Schema 要求投稿者填写 `reviewers`。投稿时审核尚未发生，投稿者无法准确知道最终审核人；预填该字段会制造不可靠的审核记录。点击 Merge 的人也不一定是实际完成内容审核的人。

## 决策

- 从知识条目的 Frontmatter 中删除 `reviewers`。
- `authors` 继续作为必填内容元数据，由投稿者填写。
- 审核人与合并人以 GitHub Pull Request 的 review、CODEOWNERS 和 merge history 为唯一事实来源。
- 不把 GitHub 审核身份复制回 Markdown，避免重复数据和漂移。

## 行为变化

1. 投稿者不再填写或猜测审核人。
2. 校验器接受没有 `reviewers` 的条目。
3. 新条目出现 `reviewers` 时按未知字段拒绝，促使投稿使用新 Schema。
4. 当前三个示例条目移除 `reviewers`。
5. 投稿 Schema、使用指南和 PR 模板明确说明审核记录由 GitHub 承载。

## 迁移

仓库目前有 5 条知识（2 条 `active`、3 条 `deprecated` 示例），只需迁移三个 deprecated 示例。尚未合并的投稿分支若包含 `reviewers`，应删除该字段后重新运行校验。

## 验证

- 合法条目没有 `reviewers` 时通过。
- 缺少 `authors` 时失败。
- 包含旧 `reviewers` 字段时以未知字段失败。
- `npm test`、`npm run validate` 和 Skill 格式校验全部通过。

## 不做

- 不增加 `approved_by` 或 `merged_by` 字段。
- 不增加合并后自动回填 Action 或机器人提交。
- 本次不修改仓库分支保护；所需审批数量继续由 GitHub 仓库规则配置。
