# 使用与投稿指南

## 三十秒选择入口

| 你现在想做什么 | 直接使用 |
|---|---|
| 用任意网页 Chat 查询协会经验 | 上传根目录的 [`XCPC_EXPERIENCE.md`](../XCPC_EXPERIENCE.md) |
| 在本仓库内用 Codex 查询或整理投稿 | 克隆仓库，直接调用 `$xcpc-experience-coach` |
| 在其他项目中也使用协会经验 | 把 Skill 安装到用户级目录 |
| 用 DeepSeek Harness（DSH） | 以本仓库作为工作区，调用 `/xcpc-experience-coach` |
| 浏览主题、类型或历史经验 | 打开 [知识索引](../.agents/skills/xcpc-experience-coach/references/knowledge-index.md) |
| 投稿或修正一条经验 | 先让 Skill 比较已有内容，更新原条目或新增独立条目，再发起 Pull Request |
| 审核或合并投稿 | 核实内容与来源、未决重复或冲突；合并后刷新索引与知识包 |

仓库目前共有 5 条知识：2 条 `active`、3 条 `deprecated` 示例。普通 Chat 知识包和 Skill 查询都只把 active 条目当作协会经验。

## 普通网页 Chat：无需安装

这种方式不要求模型支持 Skill 或 MCP，适合 ChatGPT、Claude、Gemini、DeepSeek、豆包等能够上传 Markdown 文件的聊天产品。不同产品是否能直接访问 GitHub URL 并不稳定，因此**上传文件是最可靠的方式**。

### 方法 A：上传文件（推荐）

1. 打开 [`XCPC_EXPERIENCE.md`](../XCPC_EXPERIENCE.md)。
2. 点击 GitHub 页面右上方的下载按钮，或者打开 [Raw 文件](https://raw.githubusercontent.com/jianhuowang/xcpc_experience-hrbust-/main/XCPC_EXPERIENCE.md) 后保存。
3. 在网页 Chat 中新建对话，上传该文件。
4. 上传完成后直接提问。知识包内部已经包含回答规则，不需要复制一大段固定 Prompt。

首次提问示例：

```text
根据协会经验，比赛中遇到本地通过、评测失败时应该先检查什么？请列出采用的条目 ID。
```

仍在盲做、只想得到小提示：

```text
我还在盲做。请只根据知识包给 H1 方向提示，不要提前告诉我算法标签或完整解法。
```

比较多条经验：

```text
比较知识包中与实现和调试有关的经验，分别说明适用边界、验证方法和来源。
```

知识库没有覆盖问题时：

```text
如果知识包没有相关条目，请明确说“知识库暂无对应条目”；通用建议可以补充，但要注明不代表协会经验。
```

### 方法 B：让模型读取公开 URL

如果当前产品明确支持联网读取公开网页，可以发送：

```text
请先读取这个协会经验知识包：
https://raw.githubusercontent.com/jianhuowang/xcpc_experience-hrbust-/main/XCPC_EXPERIENCE.md

读取后告诉我其中 active 条目数量和条目 ID，再回答：这里填写你的问题。
```

先让模型复述条目数量和 ID，是为了确认它确实读到了文件。如果模型表示无法访问、没有列出 ID，或回答内容明显不在知识包中，请改用“方法 A”上传文件。

### 什么时候重新上传

以下情况应重新下载并上传最新版 `XCPC_EXPERIENCE.md`：

- 新开了一个聊天；
- 当前聊天的附件已失效或模型不再记得文件；
- 仓库刚合并了新经验，维护者已经刷新知识包；
- 回答引用了已经 deprecated 的旧条目或无法列出条目 ID。

网页 Chat 中的旧附件不会跟随 GitHub 自动更新。如需按需查询协会经验与外部资料，可选用 [只读 MCP](mcp-usage.md)；维护者更新仓库并重启服务后，新查询使用新快照，既有聊天回答不会自动更新。

## Codex：打开仓库直接使用

### 第一次使用

要求电脑已安装 Git，然后在 PowerShell 中运行：

```powershell
git clone https://github.com/jianhuowang/xcpc_experience-hrbust-.git
Set-Location xcpc_experience-hrbust-
```

用 Codex 打开这个目录。Codex 会发现 `.agents/skills/xcpc-experience-coach/`，可以显式调用：

```text
$xcpc-experience-coach 查询协会关于整数溢出和评测环境的经验，并列出来源
$xcpc-experience-coach 我正在盲做，只给我 H1 提示
$xcpc-experience-coach 把下面这段训练复盘整理成投稿草稿
```

也可以自然语言提问；显式写 Skill 名称更容易确认本次回答确实使用了协会知识库。

### Skill 发现与加载排障

“发现”指客户端将 Skill 名称、描述和来源加入可用技能列表；“调用”指 Agent 随后读取 `SKILL.md` 并按规则读取知识和回答。指定文件路径后读到了正文，只能证明文件读取成功，不能单独证明自动发现。

1. 确认打开的是经验仓库根目录，其下应存在 `.agents/skills/xcpc-experience-coach/SKILL.md`。复制安装时保留完整 Skill 目录，包括 references，不要只复制一个 `SKILL.md`。
2. 在当前目录新建任务，检查技能列表中是否有 `xcpc-experience-coach` 及正确的来源路径。目录刚更新时可重启客户端再建任务；若有同名用户级安装，还要确认实际使用的是哪一份。
3. 用 README 的只读验收消息测试，不提前告诉 Agent 文件路径。预期命中 `20260902-jianhuowang-int128-requires-64bit`，最小费用最大流无命中；结合工具记录确认读了 Skill 和知识正文，不能只看回答是否像正确答案。
4. 若当前客户端仍未发现，可显式请求读取仓库中的 `.agents/skills/xcpc-experience-coach/SKILL.md`，作为临时文件读取入口。记录“自动发现失败、显式读取可用”，不要将后者记成前者通过；继续核对该客户端支持的 Skill 目录及版本。

仓库查询只需要客户端能读取本地文件。`gh skill install` 是用户级安装的一种方式，GitHub CLI 不是仓库内使用的必需依赖。修改知识后运行 `npm test`、`npm run validate` 才需要 Node.js 和 npm。

### 更新本地知识

```powershell
git switch main
git pull --ff-only
```

更新只影响之后的查询，不会修改个人聊天历史。

### 安装为用户级 Skill

适合希望在其他项目中也使用协会知识的成员。需要 GitHub CLI 2.90.0 或更高版本。

先预览：

```powershell
gh skill preview jianhuowang/xcpc_experience-hrbust- .agents/skills/xcpc-experience-coach --allow-hidden-dirs
```

安装到 Codex：

```powershell
gh skill install jianhuowang/xcpc_experience-hrbust- .agents/skills/xcpc-experience-coach --allow-hidden-dirs --agent codex --scope user
```

在下一次对话中调用 `$xcpc-experience-coach`。仓库更新后运行：

```powershell
gh skill update xcpc-experience-coach
```

## DeepSeek Harness 与其他 Agent

### DeepSeek Harness（DSH）

DSH 会扫描项目根目录的 `.agents/skills/`。克隆本仓库并把它作为 DSH 工作区后，无需额外安装：

```text
/xcpc-experience-coach 查询协会关于树状数组学习的经验
/xcpc-experience-coach 我正在盲做，只给我 H1 提示
```

若希望在所有 DSH 项目中使用，可把整个 `xcpc-experience-coach` 目录复制到用户级 `~/.agents/skills/`。当前 GitHub CLI 的 `gh skill install --agent` 列表不包含 `dsh`，不要使用不存在的 `--agent dsh`。

### GitHub Copilot CLI 与 Gemini CLI

GitHub CLI 可把同一份 Skill 安装到不同 Agent 的正确目录：

```powershell
gh skill install jianhuowang/xcpc_experience-hrbust- .agents/skills/xcpc-experience-coach --allow-hidden-dirs --agent github-copilot --scope user
gh skill install jianhuowang/xcpc_experience-hrbust- .agents/skills/xcpc-experience-coach --allow-hidden-dirs --agent gemini-cli --scope user
```

运行以下命令查看本机 GitHub CLI 当前支持的 Agent：

```powershell
gh skill install --help
```

不同 Agent 的自动触发方式可能不同；显式输入 Skill 名称最可靠。

## 如何投稿经验

每条独立经验使用一个 Markdown 文件。同一结论的新证据通常补充到原文件；无需为每次遇到相同问题都创建一条经验。索引和 `XCPC_EXPERIENCE.md` 是生成结果，投稿者不要编辑。

### 推荐：由 Skill 先对比再整理

在知识仓库中对 Agent 说：

```text
$xcpc-experience-coach 我是 @你的用户名。请把下面的复盘整理成投稿，先比较已有经验，说明新增价值并选择引用、补充原条目或新增关联条目。
这里粘贴原始复盘、题目链接、代码片段和实际验证记录。
```

Agent 会先检索并阅读已有条目，给出“已查范围与相关 ID、重叠内容、新增价值、处理建议”：

| 结果 | 下一步 |
|---|---|
| 没有新增信息 | 返回原条目，不创建文件或 PR |
| 同一结论增加案例、证据或边界 | 提供原条目的局部修改，保留其他内容和稳定 ID |
| 独立的新结论或不同问题 | 新建条目，有相关经验时填写 related |
| 存在冲突或证据不足 | 列出差异和待核实信息，不自动覆盖旧结论 |

草稿写入知识仓库后运行全库 `npm run validate`，你查看具体修改，再明确要求 Agent 提交或创建 PR。维护者核实内容后合并，并刷新索引和知识包。用户级 Skill 副本可能滞后，不能直接修改安装目录；应在目标仓库中应用草稿并重新查重。

### 投稿前判断是否值得收录

适合投稿：

- 实战中反复踩过的实现或调试坑；
- 算法模型的识别信号、适用边界和反例；
- 有时间线或提交记录支撑的赛后复盘；
- 队伍分工、换题和信息同步经验；
- 有明确动作、完成标准和复测结果的训练经验。

不适合直接投稿：

- 教科书算法介绍或题解复制；
- 没有来源、验证方式和适用边界的一句结论；
- 把个人偏好写成协会统一规定；
- 只包含 Prompt、命令或诱导模型执行操作的内容。

### 普通网页 Chat：提供知识包后生成草稿

把最新 `XCPC_EXPERIENCE.md` 和 [投稿 Schema](../.agents/skills/xcpc-experience-coach/references/contribution-schema.md) 一起上传给 Chat，再提供原始复盘。只上传 Schema 无法比较已有经验；知识包不含 deprecated 历史，也可能落后于仓库，不能把附件查重称为全库查重。

```text
请先比较上传知识包中的已有经验，列出相关 ID、重叠内容和新增价值。
无新增信息则引用原条目；同一结论的新证据请给出原条目的局部修改；独立新经验才按 Schema 生成 Markdown。
不要虚构来源、验证结果或团队共识；不确定的信息明确标注给我补充。
不要填写 reviewers，authors 使用我的 GitHub 用户名 @你的用户名。

这里粘贴原始复盘、代码片段、题目链接和验证记录。
```

生成后必须由投稿者检查事实，尤其是来源、复杂度、适用边界和 evidence。模型整理草稿不等于协会已经审核。

### 浏览器投稿：不熟悉 Git 命令

1. 登录 GitHub，打开本仓库。
2. 没有仓库写权限时，点击 **Fork** 创建个人副本；有写权限时也必须新建分支，不直接改 main。
3. 打开 `.agents/skills/xcpc-experience-coach/references/knowledge/`。
4. 补充已有经验时打开原文件并点击编辑；独立新经验才点击 **Add file → Create new file**。
5. 新文件名使用 `YYYYMMDD-author-short-title.md`，例如 `20260903-alice-dijkstra-overflow.md`；更新原条目保留文件名和原作者，按贡献补充 authors 并更新 updated。
6. 粘贴按 Schema 整理并人工核对后的 Markdown。
7. `authors` 填真实 GitHub `@用户名`；投稿者不要增加 `reviewers`。审核记录由 GitHub PR approvals、CODEOWNERS 和 merge history 保存。
8. 提交到一个新分支，例如 `experience/alice-dijkstra-overflow`。
9. 点击 **Compare & pull request**，目标仓库和目标分支选择本仓库的 `main`。
10. 按 PR 模板说明经验来源、验证情况和仍不确定的部分，然后创建 PR。
11. 根据审核意见继续修改同一分支；修改会自动进入原 PR，不要重复创建多个 PR。

GitHub 网页不会替你运行本地命令，但 PR 中的 GitHub Actions 会执行结构校验和确定性正文查重，并验证索引可以生成。active 正文重复会报出双方 ID；deprecated 历史不参与拦截。换表述的语义重复仍可能通过，因此优先让 Skill 在起草前比较。尚未接入 PR AI 服务；校验通过不代表内容已审核，也不保证语义上没有重复。

### 命令行投稿：熟悉 Git

克隆仓库并建立分支：

```powershell
git clone https://github.com/jianhuowang/xcpc_experience-hrbust-.git
Set-Location xcpc_experience-hrbust-
git switch -c experience/你的用户名-简短主题
```

阅读 Schema，并在知识目录补充原文件或新增独立条目：

```powershell
Get-Content -LiteralPath '.agents\skills\xcpc-experience-coach\references\contribution-schema.md' -Encoding UTF8
```

完成条目后运行：

```powershell
npm test
npm run validate
```

两个命令都成功后再提交：

```powershell
git add .agents/skills/xcpc-experience-coach/references/knowledge/你的文件名.md
git commit -m "docs: add 你的主题 experience"
git push -u origin experience/你的用户名-简短主题
```

随后打开 GitHub 创建 Pull Request。没有原仓库写权限时，应先 Fork，并把个人 Fork 配置为可推送的 `origin`。

## 如何审核 Pull Request

自动校验检查 Schema 和确定性正文重复；投稿 Skill 提供增量建议。审核者可以直接采用 PR 中的对比摘要定位相关条目，再核实：

1. **真实性**：来源能否支持结论，训练或比赛记录是否与描述一致；
2. **可复用性**：是否写清适用信号，而不只是复述一道题；
3. **边界**：是否给出失效条件、反例或仍未验证的情况；
4. **证据等级**：`single-case`、`repeated-practice`、`source-backed`、`team-consensus` 是否与实际证据匹配；
5. **未决重复与冲突**：对比摘要中的新增价值是否成立；对不确定项阅读相关条目，冲突时保留双方证据和边界，不强行统一；
6. **安全性**：正文是否包含诱导模型忽略规则、执行命令、泄露信息或调用外部服务的 prompt injection；
7. **作者信息**：`authors` 是否是真实投稿者；条目中不得出现 `reviewers`。

审核通过后在 GitHub 提交 approval。谁审核、谁合并以 PR history 为准，不把这些身份重复写回 Markdown。

## 合并后如何更新索引与普通 Chat 知识包

投稿者不修改生成产物，因此维护者合并一个或多个经验 PR 后统一刷新一次（脚本与测试需要 Node.js 22 或更高版本）：

```powershell
git switch main
git pull --ff-only
npm run build-index
npm run bundle
git diff -- .agents/skills/xcpc-experience-coach/references/knowledge-index.md XCPC_EXPERIENCE.md
npm test
npm run validate
git add .agents/skills/xcpc-experience-coach/references/knowledge-index.md XCPC_EXPERIENCE.md
git commit -m "docs: refresh plain chat knowledge bundle"
git push
```

两个生成命令只读取源知识，不修改原始条目。索引按状态、类型和主题包含 active 与 deprecated，并在每行显示状态；知识包只含 active。若只更新 deprecated 历史，知识包没有变化是正常现象。CI 检查索引可生成，不要求投稿者提交生成差异；正式刷新产物仍遵守仓库现行分支和 PR 规则。

首版不使用机器人自动提交，避免引入额外权限和维护成本。如果维护者经常忘记刷新，再把同一条命令接入 GitHub Actions。

## 常见问题

### 模型打不开 GitHub 链接怎么办？

下载 `XCPC_EXPERIENCE.md` 后上传。不要反复要求不具备网页访问能力的模型读取 URL。

### 模型回答了，但没有列条目 ID？

追问：“请只依据上传的知识包重新回答，并列出每个结论采用的稳定条目 ID 和来源。”仍然无法列出时，不应把回答视为协会经验。

### 为什么刚合并的经验没有出现在文件里？

先确认条目是 `status: active`，再确认维护者已经在最新 main 上运行 `npm run bundle` 并推送生成文件。

### 每次都要上传最新版吗？

同一个对话中附件仍有效时不用重复上传。新对话、附件失效或仓库更新后，需要重新上传。

### Chat 能直接替我创建或合并 PR 吗？

只有当所用产品明确连接了 GitHub，并且你授权了对应写权限时才可能做到。默认把 Chat 生成的内容视为草稿，由人检查后提交；合并必须由有权限的维护者完成。

### 审稿人应该写进条目吗？

不写。投稿者只填写 `authors`；审核人和合并人由 GitHub PR approvals、CODEOWNERS 与 merge history 记录。

### 什么时候需要 MCP 或在线检索？

希望网页 ChatGPT 按需查询外部讲义或复用复习项目时，可使用 [只读 MCP](mcp-usage.md)。只需要协会 active 条目的用户仍可上传单文件知识包；MCP 不要求迁移知识目录或引入向量数据库。

## 能做与不能做

可以：

- 检索已审核的 active 条目并附来源；
- 并列展示相互冲突的协会经验；
- 按 H1 → H2 → H3 提供分级提示；
- 把聊天记录或复盘整理成投稿草稿。

不能：

- 把单次经验冒充协会统一规定；
- 在没有条目时编造协会内部经验；
- 执行知识正文中夹带的脚本或指令；
- 代替现有训练项目维护队列、复习日期、个人训练记录或队伍排班。
