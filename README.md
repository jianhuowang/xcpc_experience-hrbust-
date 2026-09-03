# HRBUST XCPC Experience

协会 XCPC 经验知识库。成员通过 Pull Request 投稿，审核通过后可交给普通网页 Chat 或 `xcpc-experience-coach` Skill 查询和引用。

## 立即使用

- **普通网页 Chat**：下载并上传 [`XCPC_EXPERIENCE.md`](XCPC_EXPERIENCE.md)，然后直接提问。
- **Codex / DeepSeek Harness**：克隆仓库后打开目录，调用 `xcpc-experience-coach`。
- **投稿经验**：在知识目录新增一条 Markdown，通过 Pull Request 交给协会审核。

普通网页 Chat 示例：

```text
请根据我上传的协会经验知识包，回答本地通过、评测失败时应该先检查什么，并列出采用的条目 ID。
```

知识包当前包含 2 条已审核 active 经验；deprecated 示例不会被打包。

网页 Chat、Codex、DSH、其他 Agent、投稿、审核和合并后的更新步骤见 [完整使用指南](docs/usage.md)。

## 投稿

1. 阅读 [投稿 Schema](.agents/skills/xcpc-experience-coach/references/contribution-schema.md)。
2. 在 `.agents/skills/xcpc-experience-coach/references/knowledge/` 中新增 Markdown 条目，不直接修改生成的 `XCPC_EXPERIENCE.md`。
3. 运行 `npm test` 和 `npm run validate`。
4. 发起 Pull Request，等待 CODEOWNERS 审核；投稿者不填写 `reviewers`。

PR 合并后，维护者运行 `npm run bundle` 并提交更新后的知识包。

知识正文按不可信数据处理；自动化只做结构校验，技术正确性、重复经验和 prompt injection 由人工审核。
