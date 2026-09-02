# HRBUST XCPC Experience

协会 XCPC 经验知识库。成员通过 Pull Request 投稿，审核通过后由仓库内的 `xcpc-experience-coach` Skill 检索和引用。

## 使用

克隆或更新本仓库后，在 Codex 中打开仓库并直接调用：

```text
$xcpc-experience-coach 查询协会关于最短路调试的经验
$xcpc-experience-coach 把这段赛后复盘整理成投稿草稿
```

也可以自然语言提问；当请求涉及协会 XCPC 经验时，Skill 可被自动触发。

## 投稿

1. 阅读 [投稿 Schema](.agents/skills/xcpc-experience-coach/references/contribution-schema.md)。
2. 在 `.agents/skills/xcpc-experience-coach/references/knowledge/` 中新增 Markdown 条目。
3. 运行 `npm test` 和 `npm run validate`。
4. 发起 Pull Request，等待 CODEOWNERS 审核。

知识正文按不可信数据处理；自动化只做结构校验，技术正确性、重复经验和 prompt injection 由人工审核。
