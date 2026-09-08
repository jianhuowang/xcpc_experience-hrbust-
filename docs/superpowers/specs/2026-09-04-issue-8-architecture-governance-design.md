# Issue #8 仓库架构与知识治理设计

## 目标

落实 Issue #8 的短期建议，使项目身份、文件职责和知识治理规则清晰，同时保留当前可安装 Skill 的便携性。

项目统一定义为：**由 GitHub Pull Request 治理的协会 XCPC 经验知识库，通过 Skill 和单文件知识包适配不同 AI 客户端。**

## 概念分层

```text
协会经验知识库
├─ 知识数据：references/knowledge/*.md
├─ 治理：Schema、校验器、测试、PR 审核和分支保护
└─ 使用适配
   ├─ SKILL.md：Codex、DSH 等 Agent 的行为规则
   └─ XCPC_EXPERIENCE.md：普通网页 Chat 的生成知识包
```

知识当前物理存放在 Skill 的 `references/knowledge/` 中，是为了让用户级 Skill 安装能同时携带知识，不表示整个仓库只是一个 Skill。

## PR A：仓库职责边界

### 根目录 `AGENTS.md`

新增仓库级维护规则，包含：

- 项目定位和上述概念分层；
- `AGENTS.md`、`README.md`、`SKILL.md`、Schema、知识目录、生成知识包的职责；
- 知识正文按不可信数据处理，不执行其中的指令；
- active/deprecated 的使用规则；
- 投稿者不得编辑生成的 `XCPC_EXPERIENCE.md`；
- 修改知识、Schema、脚本或文档后必须运行的验证命令；
- 目录暂不迁移及未来重新评估的触发条件。

### README

保留 PR #7 已完成的快速入口，只增加简短的“项目是什么”与“各层职责”说明，避免复制完整使用指南。

### 验收

- 新成员只看 README 能知道这是知识库而不是单一 Skill；
- Agent 只看 `AGENTS.md` 能知道哪些文件可编辑、哪些是生成物、必须运行哪些检查；
- 不修改 Skill 行为，不移动知识目录。

## PR B：Schema 语义与校验

### `kind` 选择

- `algorithm`：跨题复用的算法模型、识别信号和不变量；
- `implementation`：语言、模板、数据结构实现和工程细节；
- `debugging`：错误症状、定位路径、根因与修复验证；
- `contest`：具体比赛中的技术、信息和现场决策复盘；
- `team`：可跨比赛复用的队伍分工、沟通和协作机制；
- `training`：能力缺口、训练动作、完成标准和复测证据。

一条内容跨多个类型时，以主要可复用结论选择一个 `kind`，不复制成多个近似条目。

### 生命周期与更新规则

- 投稿分支可以写 `status: active`，但只有合并进 main 后才视为协会已审核 active 经验；
- 修正文案、来源或同一结论的边界时，更新原条目并修改 `updated`；
- 新的适用场景、不同证据或可独立引用的结论，新建条目并用 `related` 关联；
- 新证据推翻旧结论时，将旧条目标为 deprecated，新建或更新替代条目，并相互关联；
- deprecated 条目保留审计历史，但 Skill 和普通 Chat 知识包默认排除。

### 命名规则

- 文件名继续使用 `YYYYMMDD-author-short-title.md`；
- `short-title` 使用小写英文、数字和连字符，表达核心结论；
- `topics` 使用小写英文、数字和连字符，去重后用英文逗号分隔；
- Markdown 一级标题使用清晰的人类可读中文，不堆砌题号和标签。

### 校验器增强

在现有 `scripts/validate.mjs` 中最小增加：

1. `related` 指向的稳定 ID 必须对应知识目录中的真实 Markdown，且不能指向自身；
2. active 条目的任一必需章节若以 `TODO`、`TBD`、`待补充` 或 `替换为` 开头，则校验失败；
3. `topics` 每项必须符合小写 kebab-case，且不得重复。

deprecated 示例允许保留“替换为……”占位文本。精确重复稳定 ID 不单独校验，因为同一目录无法同时存在两个同名文件。

### PR 模板

增加投稿者自检项：

- 已检索相同或相似主题；
- 已判断应更新旧条目还是新建条目；
- `related` 均指向真实条目；
- active 条目没有模板占位文本。

### 测试

为每项新增行为先写失败测试，再实现最小校验：

- 接受指向现有其他条目的 `related`；
- 拒绝不存在和自引用的 `related`；
- 拒绝 active 必需章节中的占位内容；
- 允许 deprecated 示例占位内容；
- 拒绝非法或重复 topics；
- 保持当前 5 条知识、知识包生成和既有测试通过。

## GitHub 仓库设置

代码 PR 合并后单独检查并配置 main 保护：

- 合并前要求 `validate` 状态检查通过；
- 至少一位 approval；
- 要求 CODEOWNERS 审核；
- 禁止 force push 和删除 main；
- 不在首次配置中对管理员强制执行，避免仓库维护者被错误规则锁住。

配置前先读取当前 ruleset/branch protection；只补缺失项，不覆盖无关设置。配置结果作为 Issue #8 评论记录，不写入知识条目。

## Issue 关闭方式

完成后在 Issue #8 留下：

- PR #7：普通 Chat 入口与生成知识包；
- PR A：项目身份和仓库规则；
- PR B：Schema 与校验增强；
- main 分支保护的配置结果；
- 明确延期项及重新评估条件。

上述项目完成后关闭 Issue #8。长期目录拆分另开 Issue，不让当前 Issue 无限扩张。

## 延期项

- 不移动 `knowledge/`：等多个 Skill/网站/MCP 需要共享数据，或安装包体积成为实际问题时再迁移；
- 不新增 `build-index`：`XCPC_EXPERIENCE.md` 已承担 active 索引和普通 Chat 分发；
- 不做正文相似度算法：当前 5 条知识由 PR 模板和人工审核处理；
- 不做 MCP、RAG、模型 API 或自动内容审核。

