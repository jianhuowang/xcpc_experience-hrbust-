# HRBUST XCPC Experience

协会共享的 XCPC 经验知识库：查询已有经验，把做题、调试和比赛中的可复用经验整理成稿，通过 Pull Request 审核后持续积累。个人训练记录和复习排程属于独立的 XCPC Trainer。

## 快速开始

先选一种使用方式，无须全部配置：

| 使用场景 | 怎么开始 | 可用资料 |
|---|---|---|
| 在本仓库中使用 Agent | 按下方三步操作，无须用户级安装 | 协会经验＋仓库内外部资料 |
| 在其他项目中使用 Agent | [安装为用户级 Skill](docs/usage.md#安装为用户级-skill) | 随 Skill 安装的协会经验；外部资料需提供完整仓库路径 |
| 普通聊天模型，手动接入 | 下载[知识包](XCPC_EXPERIENCE.md)，上传到聊天后提问；[详细步骤](docs/usage.md#普通网页-chat无需安装) | 知识包生成时的协会 active 经验，不含外部资料 |
| 网页 ChatGPT，通过 MCP 接入 | 使用维护者提供的 HTTPS MCP 地址，[配置连接器](docs/mcp-usage.md#3-chatgpt-创建连接器) | 已部署版本的协会经验、外部资料和投稿规范 |

只想浏览内容，可以直接打开[协会知识索引](.agents/skills/xcpc-experience-coach/references/knowledge-index.md)或[外部资料索引](sources/wzj52501/index.md)。

### 在仓库中使用 Agent：三步开始

前置条件：Git，以及已登录、支持仓库 Skill 的 Agent 客户端。下面以 Codex 为例。**只查询不需要 Node.js、GitHub CLI，也不需要另外安装用户级 Skill。**其他客户端的加载方式见[使用指南](docs/usage.md#deepseek-harness-与其他-agent)。

1. 获取仓库，在 PowerShell 中执行：

   ```powershell
   git clone https://github.com/jianhuowang/xcpc_experience-hrbust-.git
   Set-Location xcpc_experience-hrbust-
   ```

2. 用 Agent 客户端打开这个目录，新建任务。目录中应直接看到本 README 和 `AGENTS.md`，不要打开包含多个项目的上级目录。

3. 首次使用发送：

   ```text
   只测试，不修改文件、不创建 PR、不联网。
   请检查客户端可用 Skill 列表是否包含 xcpc-experience-coach，并报告来源路径。
   如果未发现就明确说明，不通过搜索文件代替发现验证。
   发现后使用该 Skill 查询协会关于 __int128 评测环境的经验，
   列出采用的完整条目 ID 和实际读取文件。
   ```

应发现本仓库的 Skill，并读到 `20260902-jianhuowang-int128-requires-64bit`。仅回答“已加载”不算发现成功，需要可用 Skill 列表或客户端调用记录佐证。未发现时看[加载排障](docs/usage.md#skill-发现与加载排障)；已有 Codex 验收记录见 [Issue #8 验收](docs/acceptance-issue-8.md)。

之后直接说需求即可，例如：`请使用 xcpc-experience-coach，帮我分析这段代码的溢出问题。` 正在盲做时说明当前思路和卡点；要完整题解时明确提出。

## 投稿一条经验

**单次经验也可以投稿。**重点是可复用结论、真实依据和适用边界，不要求难题或积累多次 AC。已有同一结论时补充原条目；没有实际增量就引用旧条目。具体要求以[投稿 Schema](.agents/skills/xcpc-experience-coach/references/contribution-schema.md)为准。

1. **让 Agent 初筛并起草。** 本地调用 `xcpc-experience-coach`；网页 MCP 先调用 `contribution_guide`。它会比较相似条目，给完整初稿和集中待确认项。
2. **审阅并补齐。** 确认事实、适用条件和来源后，取得最终 Markdown、文件名及 PR 标题/描述。作者等未知信息可以先留空，但上传前需要补齐。
3. **保存到投稿分支。** 新条目放在 `.agents/skills/xcpc-experience-coach/references/knowledge/`，例如 `trie-lcp-count-contribution.md`；更新旧条目保留原文件名。只复制聊天代码块内部，文件第一行直接是 `---`，不要保存外层反引号。不要编辑生成索引或知识包。
4. **向 main 创建 PR。** 有本地环境时运行 `npm test` 和 `npm run validate`；只用 GitHub 网页时写明“本地未运行，等待 CI”，不要提前勾选通过。Agent 初筛与 CI 不替代人工内容审核；合并后才作为已审核协会经验。

[GitHub 网页投稿步骤](docs/usage.md#浏览器投稿不熟悉-git-命令) · [命令行投稿](docs/usage.md#命令行投稿熟悉-git) · [网页 MCP 整理稿件](docs/mcp-usage.md#网页整理投稿再手动-pr)

## 协会经验与外部资料

- **协会经验**：经过 PR 审核的 active 条目，使用稳定条目 ID 引用。deprecated 条目保留历史，默认不用于回答，也不进入知识包。
- **外部资料**：[wzj52501 资料库](sources/wzj52501/README.md)是独立参考层，保留固定来源、许可、页段定位和提取状态。收录不等于协会验证；公式、图表等可能仍有转录缺失，关键内容需核对原件。

索引和知识包都是生成产物；新条目合并后需维护者重建，MCP 需部署新版本。查询以实际源文件或工具返回的版本为准，单独安装的 Skill 不自动携带根目录外部资料。

## 维护者与文档导航

| 文件或目录 | 负责什么 |
|---|---|
| 本 README | 使用方式选择、快速开始和投稿入口 |
| [AGENTS.md](AGENTS.md) | 仓库定位、目录职责、维护验证和安全边界 |
| [SKILL.md](.agents/skills/xcpc-experience-coach/SKILL.md) | Agent 查询、提示与投稿整理行为 |
| [投稿 Schema](.agents/skills/xcpc-experience-coach/references/contribution-schema.md) | 文件命名、字段、正文要求及更新/废弃规则 |
| [knowledge/](.agents/skills/xcpc-experience-coach/references/knowledge/) | 可编辑的协会知识源；放在 Skill 内便于随安装分发 |
| [docs/usage.md](docs/usage.md) | 各客户端使用、投稿、PR 审核及更新的详细步骤 |
| [docs/mcp-usage.md](docs/mcp-usage.md) | MCP 服务部署、连接与验收；普通成员无须自行部署 |
| [sources/wzj52501/](sources/wzj52501/README.md) | 外部资料清单、转录及重建方法 |

运行测试、校验或 MCP 服务需要 **Node.js 22+ 和 npm**。首次在仓库根目录执行：

```powershell
npm ci
npm test
npm run validate
```

校验检查格式、重复稳定 ID、`related` 引用和确定性正文重复；技术正确性、语义增量和来源质量仍由 PR 审核。

知识合并后，维护者执行 `npm run build-index` 和 `npm run bundle`，检查并提交生成差异；修改外部资料时另运行 `npm run validate:library`。详见[审核流程](docs/usage.md#如何审核-pull-request)和[生成产物更新](docs/usage.md#合并后如何更新索引与普通-chat-知识包)。
