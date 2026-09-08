# 投稿 Schema

## 文件名

使用 `YYYYMMDD-author-short-title.md`，文件名去掉 `.md` 后即稳定条目 ID。

`short-title` 使用小写英文、数字和连字符，表达核心结论。正文一级标题使用清晰的人类可读中文，不堆砌题号和标签。

通常直接在知识目录新增文件。校验与打包也支持子目录，但整棵知识目录中不能有同名 Markdown，避免稳定 ID 重复；来源链接保留子目录路径。

## Frontmatter

```yaml
---
kind: algorithm
topics: graph, shortest-path
evidence: repeated-practice
authors: "@alice"
status: active
updated: 2026-09-02
related:
---
```

- `kind`：`algorithm / implementation / debugging / contest / team / training`
- `evidence`：`single-case / repeated-practice / source-backed / team-consensus`
- `status`：`active / deprecated`
- `topics`、`authors` 可用英文逗号分隔多项
- `topics` 至少一项，每项使用小写英文/数字 kebab-case（如 `fenwick-tree`、`x86-64`）；不得重复或出现空项
- `authors` 至少包含一位投稿者，并使用 GitHub `@用户名`
- 审核人与合并人不写入条目；GitHub PR approvals、CODEOWNERS 和 merge history 是唯一审核审计来源
- `related` 可省略、留空或填写逗号分隔的稳定条目 ID；目标必须是当前知识目录中存在的其他条目，不得指向自身，可以关联 deprecated 历史

Frontmatter 使用单行 `key: value`，值可加单引号或双引号；同一字段不得重复。不支持多行、嵌套 YAML。

## 如何选择 kind

| kind | 主要可复用结论 |
|---|---|
| `algorithm` | 跨题复用的算法模型、识别信号和不变量 |
| `implementation` | 语言、模板、数据结构实现和工程细节 |
| `debugging` | 错误症状、定位路径、根因与修复验证 |
| `contest` | 具体比赛中的技术、信息和现场决策复盘 |
| `team` | 可跨比赛复用的分工、沟通和协作机制 |
| `training` | 能力缺口、训练动作、完成标准和复测证据 |

跨多个类型时，以主要结论选择一个 `kind`，不要复制成多个近似条目。

## 更新与生命周期

- 投稿前检索并阅读相关条目，说明已有 ID、重叠内容、新增价值和处理建议；可以直接采用投稿 Skill 生成的对比摘要。已有相同结论且没有新增信息时引用原条目，无需创建投稿。
- 修正文案、来源，或为同一结论补充案例、证据和边界时，更新原条目并修改 `updated`。保留稳定 ID、原作者和未涉及的正文，按实际贡献补充 `authors`，不要整篇替换丢失旧证据。
- 可独立引用的新结论或需要独立说明的不同问题，创建新条目并用 `related` 关联已有经验；仅换题目、表述、标签或增加一份相同结论的证据不构成独立条目的理由。
- 新证据与旧结论冲突时先并列证据和适用条件，交由审核者核实；确认推翻后再将旧条目标为 deprecated，新建或更新替代条目，并相互关联。
- 投稿分支可填写 `status: active`，但只有通过 PR 审核合并进 main 后才作为已审核协会经验。结构校验不代替人工内容审核。
- deprecated 条目保留历史，默认不用于查询，也不进入普通 Chat 知识包；不要为了清理目录直接删除被引用条目。

`npm run validate` 会拦截全库 active 条目的确定性正文重复：忽略 Frontmatter、开头一级标题、CRLF/LF 和首尾空行，保留正文内部空白、代码、数字、来源与证据。报错会列出重复双方的 ID。deprecated 历史不参与此项拦截；通过校验不表示没有语义重复，换一种表述或来源即可超出确定性检查的能力。

## 公共正文

每个章节必须有实际内容：

```markdown
# 标题

## 经验结论
## 适用信号
## 常见 blocker 或失败症状
## 原因与原理
## 验证方式
## 边界与反例
## 来源
```

`来源` 至少一项；外部链接必须使用 HTTPS。

active 条目的任一必需章节都不能以 `TODO`、`TBD`、`待补充` 或 `替换为` 开头。deprecated 示例允许保留模板占位文本。

## 类型扩展

| kind | 额外必需章节 |
|---|---|
| `algorithm / implementation / debugging` | `核心模型或不变量`、`复杂度与约束`、`实现风险`、`迁移识别` |
| `contest / team` | `技术层复盘`、`团队信息层复盘`、`现场决策层复盘`、`应保留的做法`、`下一次实验` |
| `training` | `暴露的问题`、`训练动作`、`完成标准`、`复测结果` |

算法类条目可另加 `H1`、`H2`、`H3`，分别保存方向、关键观察和完整解法。
