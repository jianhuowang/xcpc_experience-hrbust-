# HRBUST XCPC Experience

协会 XCPC 经验知识库。成员通过 Pull Request 投稿，审核通过后可交给普通网页 Chat 或 `xcpc-experience-coach` Skill 查询和引用。

## 快速开始：在仓库中使用 Agent

前置条件：已安装 Git，以及已登录、支持仓库 Skill 的 Agent 客户端。下面以 Codex 为例；在仓库内查询无需安装用户级 Skill，也不需要 GitHub CLI。修改知识并运行校验时才需要 Node.js 和 npm。

1. 在 PowerShell 中获取仓库：

   ```powershell
   git clone https://github.com/jianhuowang/xcpc_experience-hrbust-.git
   Set-Location xcpc_experience-hrbust-
   ```

2. 用 Codex 打开这个仓库目录并新建任务。应能在当前目录看到本 README 和 `AGENTS.md`；不要打开包含多个项目的上级目录。已安装 Codex CLI 的用户也可以在此运行 `codex`。

3. 先发送下面的只读验收消息，确认发现和调用均成功：

   ```text
   只测试，不修改文件、不创建 PR、不联网。
   请先检查客户端提供的可用 Skill 列表是否包含 xcpc-experience-coach，报告其来源路径；未发现就明确说明，不通过搜索文件补救。
   发现后使用该 Skill 查询协会关于 __int128 评测环境的经验，列出完整条目 ID 和实际读取的文件；再查询最小费用最大流，没有就明确说明。
   ```

当前预期：发现本仓库的 `xcpc-experience-coach`，读取 Skill 和知识正文，命中 `20260902-jianhuowang-int128-requires-64bit`；最小费用最大流应回答“知识库暂无对应条目”。仅声称“已加载”不算验收，需要结合客户端可用技能列表或实际读取记录确认。

未发现时按 [Skill 发现与加载排障](docs/usage.md#skill-发现与加载排障) 检查。其他使用方式：在别的项目中使用请看 [用户级安装](docs/usage.md#安装为用户级-skill)，普通网页 Chat 请看 [手动上传知识包](docs/usage.md#普通网页-chat无需安装)。这两种方式不属于上述仓库内快速开始的前置步骤。

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

[wzj52501 资料库](sources/wzj52501/README.md)提供固定版本的全量文件清单、[生成索引](sources/wzj52501/index.md)和按页段定位的转录。它是外部参考资料，引用独立来源 ID；不会自动变成协会已审核经验。清单记录已发现的提取限制及来源待核情况；未标记异常不等于逐页复核通过，使用公式、图表等关键结论前仍需核对原件。

在完整仓库中使用 Agent，按 [AGENTS.md](AGENTS.md) 先查目录再读相关页段。例如：`请使用 xcpc-experience-coach，查找外部搜索讲义中的剪枝原则，列出来源 ID、原文页码和提取局限。` 单独安装 Skill 不携带此资料库；应显式提供完整仓库位置。当前普通 Chat 知识包仍只包含协会经验。

维护者按资料库 README 重建，运行 `npm run validate:library` 检查清单与转录完整性。无需在线服务或向量数据库。
