# 普通网页 Chat 单文件知识包设计

## 目标

让协会成员无需安装 Codex、Skill 或 MCP 客户端，也能立即在常见网页 Chat 中查询协会经验；同时继续使用 GitHub Pull Request 完成多人投稿与审核。

成功标准：

- 投稿者仍然只新增一份独立知识条目并发起 PR；
- 合并后的 `status: active` 条目可以汇总为一个可下载、可上传、可通过公开 URL 读取的 Markdown 文件；
- 使用者只需向网页 Chat 提供这一个文件，然后直接提问；
- 汇总文件说明知识正文是不可信资料，并要求模型只引用 active 条目、列出条目 ID、在无命中时明确说明；
- Codex、DeepSeek Harness 等支持 Agent Skills 的客户端继续使用现有 Skill，不受影响。

## 不做

- 不建设 MCP Server、RAG、向量数据库、账号系统或管理后台；
- 不调用任何模型 API；
- 不让普通 Chat 直接提交或合并 PR；
- 不自动定时拉取 GitHub；
- 不把 deprecated 示例作为可回答的协会经验；
- 不改变现有投稿 Schema、审核事实来源和一条经验一个文件的组织方式。

## 方案

仓库仍是唯一事实来源。新增一个本地汇总命令，读取 `.agents/skills/xcpc-experience-coach/references/knowledge/*.md`，筛选 `status: active` 的条目，并生成仓库根目录的 `XCPC_EXPERIENCE.md`。

生成文件包含：

1. 面向模型的安全与回答规则；
2. 面向成员的极简使用步骤；
3. 本次生成所包含的 active 条目数量；
4. 每条经验的稳定条目 ID、Frontmatter 和完整正文；
5. 仓库地址与投稿入口。

不引入新的运行时依赖。脚本使用 Node.js 标准库，并复用现有知识目录和 Frontmatter 约定。

## 使用路径

### 普通网页 Chat

首选方式：下载或打开 `XCPC_EXPERIENCE.md`，把它上传到当前对话，然后直接提问，例如：

```text
根据协会经验，int128 在什么情况下仍然可能溢出？请列出条目 ID。
```

若产品支持读取公开 URL，可把 `XCPC_EXPERIENCE.md` 的 GitHub Raw 地址发给模型，并要求先读取该文件。若模型无法访问 URL，则下载文件后上传；不假设所有网页 Chat 都能稳定遍历 GitHub 仓库。

新对话、模型丢失附件上下文或仓库更新后，需要重新提供最新版文件。这是无服务器方案的明确限制。

### Codex 与支持 Agent Skills 的客户端

继续使用 `.agents/skills/xcpc-experience-coach/`。仓库内调用、用户级安装和 DSH 用法保持不变。它们无需使用汇总文件。

### 投稿者

投稿流程保持不变：创建分支、新增单独的知识 Markdown、运行校验、发起 PR。投稿者不直接编辑汇总文件，避免多人投稿时都修改同一文件而产生冲突。

### 合并者

PR 合并后，由维护者运行一次：

```powershell
npm run bundle
```

然后提交更新后的 `XCPC_EXPERIENCE.md`。首版不增加自动提交机器人；当人工更新确实频繁遗漏时，再把同一命令接入 GitHub Actions。

## 文档调整

重写 `docs/usage.md` 的入口说明，使成员先按自身场景选择：

- 只想立即提问：使用单文件知识包；
- 使用 Codex：仓库内直接调用或用户级安装；
- 使用 DSH、Copilot CLI、Gemini CLI：安装或自动发现 Skill；
- 想投稿：走 GitHub PR；
- 负责合并：合并后刷新知识包。

README 首页增加“立即使用”入口，避免新成员必须先理解 Skill、MCP 和 Agent 等术语。

## 错误处理

- 找不到知识目录时，命令失败并给出路径；
- 单个条目无法识别 `status` 时，命令失败，不静默遗漏；
- 没有 active 条目时仍生成合法文件，并明确写出知识库当前为空；
- 条目排序固定按文件名，保证重复生成结果稳定；
- 输出文件由脚本整体重建，不把它作为投稿源文件反向解析。

## 验证

新增一个最小测试，验证汇总逻辑：

- 只包含 active 条目；
- 排除 deprecated 条目；
- 输出含条目 ID 和回答约束；
- 连续运行产生相同内容。

现有 `npm test` 和 `npm run validate` 必须继续通过。生成后额外运行一次仓库校验，确认知识源文件没有受到修改。
