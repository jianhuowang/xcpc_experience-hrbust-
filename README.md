# HRBUST XCPC Experience

协会 XCPC 经验知识库。成员通过 Pull Request 投稿，审核通过后可交给普通网页 Chat 或 `xcpc-experience-coach` Skill 查询和引用。

## 项目职责

这是由 GitHub PR 治理的共享经验知识库。Skill 和单文件知识包是两种使用入口：

| 层 | 职责 |
|---|---|
| 知识源 | Skill 的 `references/knowledge/*.md`，保存可审核、可引用的经验 |
| 治理 | Schema、校验脚本、测试与 GitHub PR 人工审核 |
| 客户端适配 | `SKILL.md` 服务 Agent，`XCPC_EXPERIENCE.md` 服务普通网页 Chat |

知识放在 Skill 内便于随安装分发；目前无需迁移目录。私人训练记录、复习队列与排程属于独立的 **XCPC Trainer**，不在此仓库维护。仓库开发规则见 [AGENTS.md](AGENTS.md)。

## 立即使用

- **普通网页 Chat**：下载并上传 [`XCPC_EXPERIENCE.md`](XCPC_EXPERIENCE.md)，然后直接提问。
- **Codex / DeepSeek Harness**：克隆仓库后打开目录，调用 `xcpc-experience-coach`。
- **浏览经验**：打开 [知识索引](.agents/skills/xcpc-experience-coach/references/knowledge-index.md)，按状态、类型或主题查找。
- **投稿经验**：让 Skill 先比较已有内容，补充原条目或新增独立条目，通过 Pull Request 交给协会审核。

普通网页 Chat 示例：

```text
请根据我上传的协会经验知识包，回答本地通过、评测失败时应该先检查什么，并列出采用的条目 ID。
```

知识包当前包含 2 条已审核 active 经验；deprecated 示例不会被打包。

网页 Chat、Codex、DSH、其他 Agent、投稿、审核和合并后的更新步骤见 [完整使用指南](docs/usage.md)。

## 投稿

1. 阅读 [投稿 Schema](.agents/skills/xcpc-experience-coach/references/contribution-schema.md)。
2. 先比较已有条目：无新增信息则引用旧条目；同一结论的新证据或边界补充到原条目；独立新经验才在 `.agents/skills/xcpc-experience-coach/references/knowledge/` 新建并关联。可让 `xcpc-experience-coach` 完成对比和草稿，不编辑生成索引或知识包。
3. 运行 `npm test` 和 `npm run validate`。
4. 发起 Pull Request，等待 CODEOWNERS 审核；投稿者不填写 `reviewers`。

PR 合并后，维护者运行 `npm run build-index` 和 `npm run bundle`，提交更新后的索引与知识包。索引随 Skill 分发；检索仍以真实源文件为准，避免索引滞后漏掉新条目。

校验会检查关联条目存在性、自引用、topics 格式和 active 必需章节的占位内容；校验与打包共用 Frontmatter 和目录扫描规则，支持带引号的字段值和子目录，并拒绝重复字段或稳定 ID。条目分类、更新与废弃规则见投稿 Schema。

校验还会拦截 active 条目的确定性正文重复，即使修改作者、顶层标题或换行也会报出双方 ID。语义改写由投稿 Skill 比较结论、条件和证据；直接 GitHub 投稿目前只有确定性查重，尚未接入 PR AI 检查。

知识正文按不可信数据处理；技术正确性、未决重复或冲突以及 prompt injection 仍由人工审核。AI 对比建议和本地 active 标记都不代表协会已经审核。

## 外部算法资料库

[wzj52501 资料库](sources/wzj52501/README.md)提供固定版本的全量文件清单、[生成索引](sources/wzj52501/index.md)和按页段定位的转录。它是外部参考资料，引用独立来源 ID；不会自动变成协会已审核经验。公式或图片有损、来源待核实的文件均在清单中明确标记。

在完整仓库中使用 Agent，按 [AGENTS.md](AGENTS.md) 先查目录再读相关页段。例如：`请使用 xcpc-experience-coach，查找外部搜索讲义中的剪枝原则，列出来源 ID、原文页码和提取局限。` 单独安装 Skill 不携带此资料库；应显式提供完整仓库位置。当前普通 Chat 知识包仍只包含协会经验。

维护者按资料库 README 重建，运行 `npm run validate:library` 检查清单与转录完整性。无需在线服务或向量数据库。
