# 提取质量首批修订记录

日期：2026-09-11。范围为两份 PDF 共四页，未进行全库 OCR、整份讲义复核或算法正确性审核。线上部署须等本修订 PR 合并；当前线上旧版本的第 41 页乱码验收记录保留为历史结果。

## 原件与复核方法

读取固定上游归档，导入器的 Git blob 树摘要验证通过。另对本地用于渲染的原件计算 SHA256，与清单及归档一致：

- `wzj52501-0f0daa9b82cfef46`：[Search.pdf 固定原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Search.pdf)，SHA256 `e91823de853570e40ba127f83818a28665d0fc19be44062d63d3ddac66f5588f`。
- `wzj52501-6cc8051f4f4f2148`：[Dynamic-Programming.pdf 固定原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Dynamic-Programming.pdf)，SHA256 `620742d7361eefd995478ba399c6c19d29556c28b069d9a864553cf992efa222`。

Poppler 用物理页号渲染 PNG，Codex 视觉转录并由独立 Agent 对照同一组原图复核；不将两次视觉检查表述为人工专家审核。可复现的渲染命令为 `pdftoppm -f 41 -l 41 -scale-to 1800 -singlefile -png Search.pdf search-page-41`，其他页替换输入及页号。原二进制与 PNG 不复制到分发库。

## 修订内容

| 来源 / 物理页 | 旧提取问题 | 已对照的修订 |
|---|---|---|
| Search / 11 | 乘号与比较符控制字符；装饰图形成大量点 | `n × n`、`1 ≤ n ≤ 8`，保留题目正文 |
| Search / 41 | 比较符损坏；读入尚不可见的动画段落 | `f(x) + g(x) ≤ cans`；变量确为 `cans`，不改名；该页不含 `h(x)` |
| Search / 42 | 比较符损坏 | 保留两段可见文字，估价条件为 `h(x) ≥ g(x)`；这是原文收益场景，不推广为任意最优化方向 |
| Dynamic-Programming / 8 | `10^7` 被静默提成 `107`；读入隐藏的递推内容 | 保留可见题目与 `n ≤ 10^7`；不把后续动画中的递推式、初值归到本页 |

逐页修订原始提取哈希、转录与原因保存在 [corrections.json](../sources/wzj52501/corrections.json)，导入时自动匹配。保留原固定 URL、来源 ID、物理页号、许可与 needs-review。省略装饰点阵和重复目录导航，并调整排版空白；不是原 PDF 的完整视觉副本。

## 验证与剩余问题

- 本地 Node 45/45 通过（含真实 HTTP SDK 集成），知识 5 条和外部清单 135 份校验通过；Python 11 项中 10 项通过、1 项 Windows 符号链接能力限制跳过。重复离线导入前后 124 个资料文件哈希完全一致，`git diff --check` 通过。
- Python 修订回归覆盖错原件哈希、错提取哈希、错 ID、越界页、空修订、重复页与 withheld 拒绝；错误发生在生成输出落盘之前。
- MCP 回归覆盖修订后的四页、Search 第 41/42 页分离、未修第 43 页控制字符继续保留，以及 H1/H2 无正文。
- 独立审查未发现 P1/P2；审查指出 Search 两页漏转录一个“索”字，已按原文补齐后重建。
- DOCX `bishop-solution.docx` 的嵌入图形公式未在本批修复；需单独对照完整文档或可靠渲染结果。其空公式仍应明确报告缺失，不能填入推导值。
- 本批修訂不涵盖其他页中同类的上下标、分数、图表和隐藏动画问题；未报警不代表完整。下一批按日常使用的来源 ID 与物理页继续核对。
