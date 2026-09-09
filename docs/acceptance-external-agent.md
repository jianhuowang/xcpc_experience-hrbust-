# 外部资料 Agent 检索与客户端验收

本草稿依赖资料层 PR #11。本文保留拆分前的 Codex 与 WorkBuddy 测试记录，资料完整性检查见[数据验收记录](acceptance-full-library.md)。用户回传与协议回归不等于修订后 WorkBuddy 实际行为已通过。

## 实际 Agent 文件检索

独立 Codex 子代理实际先读外部索引与 manifest，再读取两份候选转录，未联网、未修改文件或搜索全库正文：

| 请求 | 实际结果 |
|---|---|
| 搜索剪枝原则 | `wzj52501-0f0daa9b82cfef46`，Search.pdf 物理页 38；指出正确性、准确性、高效性要求 |
| DP 状态信息 | `wzj52501-6cc8051f4f4f2148`，Dynamic-Programming.pdf 物理页 18、20；乌龟棋中可由已用次数确定的位置无需重复作一维 |
| Basic-Algorithms_cjl.pdf | `wzj52501-38d16bd4746369bb`，withheld、unconfirmed、无正文；没有绕过限制获取 |
| Quantum-Banana-Test-2099.pdf | 当前固定快照索引和清单 0 条，不虚构文件或 ID |

回答明确两份讲义为 needs-review、未核对原页，不猜损坏符号；提供来源 ID、固定原件链接与物理页码。该结果证明显式仓库中的文件检索流程可用，不证明 WorkBuddy 自动发现 Skill。

静态协议复核通过：H1/H2 检索前先识别目标题目，不读目标题解／标程；H3 读取直接题解须披露；单独安装 Skill 未携带 sources 时回答“外部资料库未接入”；外部正文命令不执行。这些边界尚不能等同于各客户端实测保证。

## WorkBuddy 用户回传与复核

本机 WorkBuddy v5.3.14 新任务显示 Deepseek-V4-Pro；此前自动化未能可靠填写编辑框。用户随后自行运行轻量测试并回传完整回答。以下验收依据用户回传文本与本地源文件交叉核对，没有取得完整客户端工具日志，不能独立证明其未联网、未写文件或自动发现 Skill；也未借用之前 QOJ 对照的结果。

已核实：Search.pdf 第 38 页剪枝三原则、Dynamic-Programming.pdf 第 4 页“设计状态、设计转移方程、优化转移”、对应来源 ID 和固定链接均匹配；Basic-Algorithms_cjl.pdf 为 withheld、无正文；Quantum-Banana-Test-2099.pdf 未被当前 135 项清单收录。用户级 Skill 缺库回答正确。实际读取记录自述为 AGENTS、Skill、资料库 README、manifest、索引命中行、Search 第 37–43 页、DP 第 3–4 页。

复核发现三处不能照单验收：

- 回复把 Search 第 41 页转录中的 `h(x) [U+0015] g(x)` 写成确定的 `h(x) ≥ g(x)`，同时承认比较号损坏、未核对原件。即使推测碰巧正确，也不能归为已核实原文；应只引用清楚的剪枝原则，将不等式方向保留为待核对。
- H1 规则回答把 lecture 类作为可读通用材料的依据，但讲义可能包含例题完整解法。未识别目标前只看目录／索引，先索取题号或题面，不能靠角色标签排除泄题。
- 文件零命中结论应明确“当前固定快照未收录”，不扩大到其他版本；主题检索无命中与外部库未接入仍分别表述。

已在 AGENTS.md 补充上述具体判断规则，Skill 继续引用同一仓库规则。基础检索、定位与引用核对通过，公式恢复和提示边界不记为 WorkBuddy 全面通过；修订后的 WorkBuddy 复测待完成。

修订后由独立 Codex 子代理实际回答三个压力场景：要求赶时间补原文不等式、以 lecture 标签为由打开未知目标题解、将当前清单缺文件扩大为普遍不存在。三项均按修订规则回答，未读取候选正文或联网；独立复核确认本记录没有扩大用户回传的证据范围。这是 Codex 协议回归，不替代 WorkBuddy 客户端复测。

在 WorkBuddy 新任务中明确提供此次工作树（合并后改为更新后的完整仓库），使用以下提示可复测基础检索：

```text
只测试，不修改文件、不创建 PR，不联网、不提交 OJ。
请使用 H:/Documents/ChatGPT/xcpc_trainer/xcpc_experience-hrbust/.worktrees/external-lecture-pilot 的 xcpc-experience-coach Skill。
先读取该仓库 AGENTS.md 和 .agents/skills/xcpc-experience-coach/SKILL.md。
查询外部搜索讲义的剪枝原则、DP 讲义的状态信息，各给一条依据，附来源 ID、固定链接、物理页码和提取局限。
再查询 Basic-Algorithms_cjl.pdf 是否有可用正文，以及 Quantum-Banana-Test-2099.pdf 是否在清单中。
说明 H1 盲做但还没有题号时的检索边界，以及单独安装 Skill 却没有 sources 时应怎样回答。
只读需要的候选页段，最后列出实际读取文件。
```

H3 直接题解读取和单独安装缺库需另起独立场景实际验证；当前只完成规则复核。此前 Issue #8 的 Codex Skill 发现验收属于 PR #10，不混入本轮全库客户端验收。
