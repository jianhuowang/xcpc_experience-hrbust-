# Issue #8：快速开始与实际 Agent 验收

验收日期：2026-09-09。目标是补齐 README 顶部快速开始，以及至少一种真实客户端的 Skill 发现与调用；不扩展 Chat 功能，不修改 Skill 行为或知识源。

## 快速开始

README 在项目介绍后直接提供前置条件、克隆命令、打开正确目录、新建任务、只读验收消息、预期条目 ID 和排障链接。usage 补充分辨自动发现与显式文件读取、同名安装来源、缺失 references 等检查。仓库内使用不要求 `gh skill install`；用户级安装和普通 Chat 使用保留独立入口。

## 真实客户端与发现证据

- 客户端：Windows 上的 `codex-cli 0.153.4`。
- 实测知识版本：main `29db3baff9791cc6cb06e88986b785ce846c99d6`，5 条知识、2 条 active。本文所在文档补丁未改变 Skill 或知识。
- 工作目录为 exp 仓库根目录，未提供额外 Skill 搜索根目录，未复制或改写安装配置。
- 向真实 `codex app-server` 发出 `initialize`、`initialized`，随后请求 `skills/list`，参数为仓库工作目录及 `forceReload: true`。
- 下方是服务实际返回字段的摘录；只将本机仓库绝对路径缩写为 `<repo>`，不是模型对“已加载”的自述。

```json
{
  "name": "xcpc-experience-coach",
  "description": "Use when users ask about HRBUST association XCPC algorithm, implementation, debugging, contest, team, or training experience; need answers grounded in this repository; want an experience contribution drafted; or request staged hints while solving a problem.",
  "path": "<repo>/.agents/skills/xcpc-experience-coach/SKILL.md",
  "scope": "repo",
  "enabled": true,
  "pluginId": null
}
```

该名称只匹配一项，来源为 repo 而非 user，证明仓库级 Skill 发现成功。接口说明见 [Codex App Server 的 Skills 文档](https://developers.openai.com/codex/app-server/#skills)。

## 调用与实际读取证据

另以 `codex exec --ephemeral --json --sandbox read-only -C <repo>` 启动全新会话，未复用之前的解题任务。消息未提供 Skill 文件路径或知识内容：

```text
这是一次只读 Skill 发现与调用验收，不修改任何文件，不提交，不创建 PR，不联网，不读取其他任务历史。请使用 xcpc-experience-coach。首先只检查客户端已提供的可用 Skill 元数据，报告是否存在这个名称、其描述和来源路径；若未发现就明确失败，不用搜索文件系统来补救。发现后读取该 Skill，并查询协会关于 __int128 评测环境的经验，列出实际条目完整 ID 与结论；再查询最小费用最大流，没有就明确说明。请记录你实际读取的文件，区分自动发现元数据与后来读取正文。
```

观察到的 JSONL 事件：

| 事件 | 实际操作与结果 |
|---|---|
| item_1 | Agent 报告在客户端 Skill 元数据中发现名称 |
| item_2 | 首次文件操作直接 `Get-Content -Raw -Encoding UTF8` 读取 Skill，退出码 0；此前没有文件搜索补救 |
| item_4 | 读取 `references/knowledge-index.md`，退出码 0 |
| item_5 | `rg` 检索知识目录中的最小费用流中英文同义词，无输出、退出码 1；这是无匹配，不是读取失败 |
| item_6 | 读取 `20260902-jianhuowang-int128-requires-64bit.md` 全文，退出码 0 |
| item_7 | 列出实际 5 个知识文件，退出码 0 |
| item_8 | 输出命中条目的完整 ID、环境相关结论，并明确“知识库暂无对应条目”回答最小费用最大流 |
| turn.completed | 会话正常结束；工具记录仅包含上述本地读取和检索，无仓库写入或联网工具操作 |

命中条目：`20260902-jianhuowang-int128-requires-64bit`。回答指出 `__int128` 的支持与编译目标环境有关；未将废弃示例作为已审核经验引用。运行后 main 工作区仍干净。

发现由 app-server 返回值验证；调用由独立 exec 会话的真实文件读取及输出验证。此次通过不代表所有客户端都能自动发现，也不证明不提 Skill 名称时一定会隐式触发。WorkBuddy 的自动发现仍不计入本项证据，之前的显式路径读取测试单独保留。

## 复现与覆盖范围

其他维护者可用 README 的三步入口和只读消息复测。支持 app-server 的客户端也可使用 `skills/list`，检查来源为当前仓库且启用，避免把同名用户级副本的发现算成仓库发现。

文档修改后执行 `npm test`（24/24）、`npm run validate`（5 条）与 `git diff --check`，均通过。没有新增仅检查文案字面的单元测试，也没有修改 Schema 或生成知识包。

Issue 中的 main 分支保护属于另一个未完成事项，不因这两项验收通过而自动完成。本记录只说明上述两项的实现与实际验证结果，文档是否发布以合并记录为准。
