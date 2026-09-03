# 使用指南

## 先看当前状态

仓库目前已经具备 Skill、投稿 Schema、PR 审核和自动校验，但三个知识条目均为 `deprecated` 示例。成员提交并合并第一批 `status: active` 条目前，查询时出现“知识库暂无对应条目”是正常结果。

## 选择使用方式

| 需求 | 推荐方式 |
|---|---|
| 在本仓库内查询或投稿 | 用 Codex 打开克隆后的仓库，无需安装 |
| 在任意项目中使用协会知识 | 安装为用户级 Skill |
| 使用 Copilot CLI、Gemini CLI 等其他 Agent | 用 GitHub CLI 指定目标 Agent 安装 |
| 使用不支持 Agent Skills 的聊天产品 | 只能手动提供 `SKILL.md` 和相关知识文件 |

## 方式一：在 Codex 中直接使用

```powershell
git clone https://github.com/jianhuowang/xcpc_experience-hrbust-.git
cd xcpc_experience-hrbust-
```

在 Codex 中打开该仓库。Codex 会发现 `.agents/skills/xcpc-experience-coach/`，随后可以显式调用：

```text
$xcpc-experience-coach 查询协会关于最短路调试的经验，并列出来源
$xcpc-experience-coach 我正在盲做，只给我 H1 提示
$xcpc-experience-coach 比较知识库中关于赛时换题的不同经验
$xcpc-experience-coach 把下面这段赛后复盘整理成投稿草稿
```

也可以直接使用自然语言提问；显式写出 Skill 名称更容易确认本次回答确实使用了协会知识库。

更新知识库：

```powershell
git pull
```

## 方式二：安装为用户级 Skill

适合希望在其他项目中也能查询协会经验的成员。需要 GitHub CLI 2.90.0 或更高版本。

先预览内容：

```powershell
gh skill preview jianhuowang/xcpc_experience-hrbust- .agents/skills/xcpc-experience-coach --allow-hidden-dirs
```

安装到 Codex：

```powershell
gh skill install jianhuowang/xcpc_experience-hrbust- .agents/skills/xcpc-experience-coach --allow-hidden-dirs --agent codex --scope user
```

安装后在下一次对话中调用 `$xcpc-experience-coach`。后续更新：

```powershell
gh skill update xcpc-experience-coach
```

## 方式三：安装到其他 Agent

Skill 本身不是 Codex 专属格式。GitHub CLI 可以把同一份 Skill 安装到不同 Agent 的正确目录，例如：

```powershell
gh skill install jianhuowang/xcpc_experience-hrbust- .agents/skills/xcpc-experience-coach --allow-hidden-dirs --agent github-copilot --scope user
gh skill install jianhuowang/xcpc_experience-hrbust- .agents/skills/xcpc-experience-coach --allow-hidden-dirs --agent gemini-cli --scope user
```

运行 `gh skill install --help` 可以查看当前 GitHub CLI 支持的其他 Agent。不同 Agent 的自动触发和工具能力可能不同；知识检索、来源引用和投稿整理仍由同一个 `SKILL.md` 约束。

### DeepSeek Harness（DSH）

DSH 原生扫描项目根目录的 `.agents/skills/`，因此克隆本仓库并以它作为 DSH 工作区后，无需额外安装。可在 Web GUI、TUI 或 ACP 前端中显式调用：

```text
/xcpc-experience-coach 查询协会关于最短路调试的经验
/xcpc-experience-coach 我正在盲做，只给我 H1 提示
```

DSH 同时支持用户级 `~/.agents/skills/`。若希望在所有 DSH 项目中使用，可把 `xcpc-experience-coach` 整个目录复制到该位置。

当前 GitHub CLI 的 `gh skill install --agent` 列表尚未包含 `dsh`，不要使用不存在的 `--agent dsh`；仓库级自动发现或手动复制即可。

## 投稿

1. 从 `main` 创建分支。
2. 阅读 [投稿 Schema](../.agents/skills/xcpc-experience-coach/references/contribution-schema.md)。
3. 在 `.agents/skills/xcpc-experience-coach/references/knowledge/` 新增 Markdown 条目。
4. 运行：

   ```powershell
   npm test
   npm run validate
   ```

5. 推送分支并发起 Pull Request，等待 CODEOWNERS 审核。

投稿者不填写 `reviewers`。实际审核人和合并人以 GitHub PR 的 review 与 merge history 为准。

Skill 可以整理草稿，但不会在没有明确授权时替成员提交或创建 PR。

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
- 代替现有训练项目维护队列、复习日期和个人训练记录。
