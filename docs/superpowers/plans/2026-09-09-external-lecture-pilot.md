# 外部讲义首批经验接入计划与验证记录

> 状态：本计划已于 2026-09-09 被用户纠正范围，暂停执行。用户目标是接入 wzj52501 的全部知识资料库，而非只投稿试用的三条经验。下文保留作为试用历史；尚未新增正式知识条目、提交或创建 PR。

## 最新范围核对

上游快照 `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e` 的完整树包含 135 个文件：66 PDF、49 C++、6 DOCX、3 PPTX、9 Markdown，以及 LICENSE 和 .gitignore。文件数不等于独立知识点或题目数，需关联同题材料和重复版本。

上游最新 README 明确代码为 MIT，题面、题解和课件为 CC BY-NC-SA 4.0；后续需保留归属、版本和相应许可，并逐文件检查第三方署名。此前未发现许可的结论只适用于旧快照。

全量接入建议采用：完整资料清单与固定版本 → 按页／章节提取可检索正文并保留来源 → Skill 按问题检索并引用外部资料 → 分主题去重、提炼可复用经验。每个原文件均记录处理结果，提取失败不可默认为成功。全量覆盖是目标，实施分批仅为控制质量。

外部来源库与协会已审核经验应保持不同的来源标识；资料进入索引不表示协会认可全文。现有 `XCPC_EXPERIENCE.md` 默认打包所有 active，不能直接承载全量原文；Skill 应按需读取，普通 Chat 后续提供主题包。初版优先静态 Markdown、来源清单和现有检索，不要求向量数据库或服务。

以下为已暂停的首批投稿计划。

目标：将用户已试用并同意推进的 wzj52501 讲义提炼稿接入现有 exp Skill。范围为状态充分性、可行性下界、状态依赖三个主题。

## 设计与约束

- 复用现有 Markdown 知识目录、Schema、索引生成与知识包；不改变 Skill 行为或增加运行时依赖。
- 上游是讲义资料库，不是现成 Skill。只写原创归纳与短来源说明，不导入整套 PDF、原题解或标准程序。
- 投稿者为本仓库用户 `@jianhuowang`，由 AI 辅助整理；讲义作者 wzj52501 单独列在来源，不冒称其参与投稿或审核。
- 三条均为 `kind: algorithm`、`evidence: source-backed`，投稿分支 `active` 不代表已审核；审核仍以 PR 合并为准。
- 原始来源固定为提交 `20b03014207ea2eed86b58478fbc6dfae8ad17bb` 中的 `Lectures/NOIP-Preparation.pdf`；采用 PDF 物理页码，从 1 开始。
- 原文案例与整理者的通用迁移分析明确区分。充分状态不等于最小状态；有限状态不等于快速；实验通过不等于最坏复杂度证明。

## 投稿前对比

已阅读全部 2 条 active：`20260902-jianhuowang-abc221e-leq` 与 `20260902-jianhuowang-int128-requires-64bit`。分别涉及贡献法／树状数组和整数／目标环境，未覆盖这三个结论。新内容可独立引用，新增三条；状态充分性与依赖结构互设 related。不复制旧条目的对拍或实现细节形成新条目。

## 实施步骤

- [x] 核对 main、工作树、用户身份与干净基线；24 项测试及 5 条校验通过。
- [ ] 在 `.agents/skills/xcpc-experience-coach/references/knowledge/` 新增 `20260909-jianhuowang-state-sufficiency.md`、`20260909-jianhuowang-feasibility-bound.md`、`20260909-jianhuowang-state-dependency.md`，包含公共及算法扩展章节、固定来源、边界与验证方法。
- [ ] 运行 `npm test`、`npm run validate`；预期 24 项测试和 8 条知识校验通过。
- [ ] 运行 `npm run build-index`、`npm run bundle`，检查包含 5 条 active，确认 3 条新增来源与 related 可解析。投稿按仓库规则不提交生成产物；合并后由维护者重新生成并提交。
- [ ] 独立只读复核技术内容和证据措辞，修复必要问题；提交并创建 PR。

## 轻量试用证据与局限

用户用两个独立 WorkBuddy 任务、相同 Deepseek-V4-Pro 模型，并关闭外部记忆，比较同一道 QOJ #16479 的单轮 H3 输出。用户报告当前 exp 组 TLE；外部材料组的用户提供评测截图显示 AC、1413 ms、21472 KB，时间标记为 2026-09-09 11:53:05。未提供公开提交链接，未独立复核提交代码与聊天代码逐字一致，也没有核实运行环境完全相同。

静态对比发现两组使用同一种存活集合分层 DP。第二组减少重复扫描，但没有改进已证明的渐近复杂度；其 `O(n/64)` 转移说明与逐个扫描 n 个敌人的代码不符。两组均出现自然死亡与计数先后顺序的错误文字，代码顺序正确。生成回答自述的随机对拍次数和压力测试耗时未由维护者核验。

因此该试用只支持继续小批量接入来源明确的通用经验，不证明外部资料导致 AC，也不构成三条结论的 repeated-practice 证据。目标题解和代码不纳入知识源。实验 ID 与正式 ID 的对应关系为：

| 实验 ID | 正式条目 ID |
|---|---|
| ext-wzj-noip2017-state-sufficiency | 20260909-jianhuowang-state-sufficiency |
| ext-wzj-noip2017-feasibility-bound | 20260909-jianhuowang-feasibility-bound |
| ext-wzj-noip2017-state-dependency | 20260909-jianhuowang-state-dependency |
