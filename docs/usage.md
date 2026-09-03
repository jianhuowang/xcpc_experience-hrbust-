# 使用与投稿指南

## 三十秒选择入口

| 你现在想做什么 | 直接使用 |
|---|---|
| 用任意网页 Chat 查询协会经验 | 上传根目录的 [`XCPC_EXPERIENCE.md`](../XCPC_EXPERIENCE.md) |
| 在本仓库内用 Codex 查询或整理投稿 | 克隆仓库，直接调用 `$xcpc-experience-coach` |
| 在其他项目中也使用协会经验 | 把 Skill 安装到用户级目录 |
| 用 DeepSeek Harness（DSH） | 以本仓库作为工作区，调用 `/xcpc-experience-coach` |
| 投稿或修正一条经验 | 新增单独的知识 Markdown，发起 Pull Request |
| 审核或合并投稿 | 检查内容与来源；合并后刷新单文件知识包 |

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

网页 Chat 中的旧附件不会跟随 GitHub 自动更新。首版刻意不部署同步服务；当知识量大到频繁上传不方便时，再考虑 MCP 或在线检索。

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

每条经验使用一个独立 Markdown 文件。这样不同成员可以同时提交各自的 PR，不会共同修改一个大文件。`XCPC_EXPERIENCE.md` 是生成结果，投稿者不要编辑它。

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

### 最省事：先让 Chat 生成草稿

把 [投稿 Schema](../.agents/skills/xcpc-experience-coach/references/contribution-schema.md) 上传给任意 Chat，再提供你的原始复盘：

```text
请把下面的原始经验整理成符合投稿 Schema 的 Markdown 草稿。
不要虚构来源、验证结果或团队共识；不确定的信息明确标注给我补充。
不要填写 reviewers，authors 使用我的 GitHub 用户名 @你的用户名。

这里粘贴原始复盘、代码片段、题目链接和验证记录。
```

生成后必须由投稿者检查事实，尤其是来源、复杂度、适用边界和 evidence。模型整理草稿不等于协会已经审核。

### 浏览器投稿：不熟悉 Git 命令

1. 登录 GitHub，打开本仓库。
2. 没有仓库写权限时，点击 **Fork** 创建个人副本；有写权限时也必须新建分支，不直接改 main。
3. 打开 `.agents/skills/xcpc-experience-coach/references/knowledge/`。
4. 点击 **Add file → Create new file**。
5. 文件名使用 `YYYYMMDD-author-short-title.md`，例如 `20260903-alice-dijkstra-overflow.md`。
6. 粘贴按 Schema 整理并人工核对后的 Markdown。
7. `authors` 填真实 GitHub `@用户名`；投稿者不要增加 `reviewers`。审核记录由 GitHub PR approvals、CODEOWNERS 和 merge history 保存。
8. 提交到一个新分支，例如 `experience/alice-dijkstra-overflow`。
9. 点击 **Compare & pull request**，目标仓库和目标分支选择本仓库的 `main`。
10. 按 PR 模板说明经验来源、验证情况和仍不确定的部分，然后创建 PR。
11. 根据审核意见继续修改同一分支；修改会自动进入原 PR，不要重复创建多个 PR。

GitHub 网页不会替你运行本地命令，但 PR 中的 GitHub Actions 会执行结构校验。校验通过只代表格式正确，技术内容仍需人工审核。

### 命令行投稿：熟悉 Git

克隆仓库并建立分支：

```powershell
git clone https://github.com/jianhuowang/xcpc_experience-hrbust-.git
Set-Location xcpc_experience-hrbust-
git switch -c experience/你的用户名-简短主题
```

阅读 Schema，并在知识目录新增文件：

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

自动校验只检查 Schema。审核者还应逐项确认：

1. **真实性**：来源能否支持结论，训练或比赛记录是否与描述一致；
2. **可复用性**：是否写清适用信号，而不只是复述一道题；
3. **边界**：是否给出失效条件、反例或仍未验证的情况；
4. **证据等级**：`single-case`、`repeated-practice`、`source-backed`、`team-consensus` 是否与实际证据匹配；
5. **重复与冲突**：是否已经存在相同经验；冲突时保留双方证据和边界，不强行统一；
6. **安全性**：正文是否包含诱导模型忽略规则、执行命令、泄露信息或调用外部服务的 prompt injection；
7. **作者信息**：`authors` 是否是真实投稿者；条目中不得出现 `reviewers`。

审核通过后在 GitHub 提交 approval。谁审核、谁合并以 PR history 为准，不把这些身份重复写回 Markdown。

## 合并后如何更新普通 Chat 知识包

投稿者不修改 `XCPC_EXPERIENCE.md`，因此维护者合并一个或多个经验 PR 后统一刷新一次：

```powershell
git switch main
git pull --ff-only
npm run bundle
git diff -- XCPC_EXPERIENCE.md
npm test
npm run validate
git add XCPC_EXPERIENCE.md
git commit -m "docs: refresh plain chat knowledge bundle"
git push
```

`npm run bundle` 只读取源知识并重新生成单文件，不会修改原始条目。若合并的条目不是 active，知识包没有变化是正常现象。

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

当 active 条目多到单文件明显过大、成员频繁忘记重新上传，或者确实需要自动检索和同步时再做。当前阶段先验证协会是否持续投稿以及知识是否真正帮助训练。

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
