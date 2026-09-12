# 全部标注 PDF：字符与可见性修复验收

日期：2026-09-12。比较基线为 PR #14 的 `bc23e38`；固定原件快照为 `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`。

本轮处理全部 53 份允许提取的 PDF、1834 物理页；13 份 withheld PDF 保持仅元数据。首轮自动提取变化覆盖 1762 页，保留 4 页视觉修订；第二轮又将其中 18 页完成视觉修订，当前为 1744 页自动修复、22 页视觉修订。显式异常从 870 页降至 0 页。

**这是字符编码与可见性修复的全库覆盖，不是全部公式或全部页面已审核。** 所有 PDF 仍为 needs-review；没有逐页 OCR，也没有生成算法题解。

## 修复依据

- 内嵌 CFF Encoding → 字形名 → Unicode；只补缺失映射，已有映射优先。用固定版本 fontTools 解析字体，不自行实现 CFF。
- 私用区符号按内嵌 TT 字形轮廓哈希恢复；三段大括号按原 CFF 字形名恢复。九份原件中 18 页、91 个 PUA 在独立回归中全部恢复。
- 三份题面的 48 个 LCIRCLE 圆角按内嵌字体 SHA256 和字形名恢复为 ╭╮╰╯，仅表示样例框线，不是数学字符。
- 透明度恰为零、不绘制及确定页外文字从提取副本排除，保留原文本推进；旋转、描边、未知字体、Form 和其他裁剪情况保留并警告。
- 原 PDF 字节不修改。来源 ID、原件哈希、物理页、许可和 needs-review 状态保留；22 页 Codex 视觉转录均先按原始 pypdf 页段哈希核验后应用。

字形依据、固定链接、核查页和署名见 [字形证据](../sources/wzj52501/pdf-symbol-evidence.json)。解析器接口参考 [fontTools CFF 文档](https://fonttools.readthedocs.io/en/latest/cffLib/index.html)。

## 实际核查与验证

- 独立代码审查两轮未发现有证据的 P1/P2。字体、可见性、原始页段哈希校验均有回归。
- 额外实际渲染比对 Geometry 34、Graph-Misc 38、Number-Theory 59、NOIP-Preparation 5、NOI/Mock-1 solutions 30；大量删除的后续文字确实不在这些原页可见区域，无可见算法正文误删。root 另核对 Search 48 与 destiny 3。
- Search 41/42、DP 8 的真实原件本地回归验证隐藏段落边界；CI 不携带上游二进制，真实原件两项在 CI 跳过，合成边界测试仍运行。
- 本地 Python 27 项测试：26 通过，1 项 Windows 符号链接测试跳过。Node 46 项通过，包含官方 MCP SDK 的真实本地 HTTP 调用；5 条协会知识与 135 条外部来源校验通过。
- 完整重建两次，122 个生成文件逐字节一致；所有非 PDF 转录与基线一致。未声称网页线上版本已更新。

## 第二轮：数学转录与样例

新增 18 页均逐页查看固定原件，并由另一 Agent 独立对照原图复核；不依靠旧提取猜测公式。修订通过已有 corrections 机制应用，没有新增解析器或依赖。

| 材料 | 新增修订物理页 | 恢复内容与适用边界 |
|---|---|---|
| Search.pdf | 43–48 | 单位分数、`19/45 = 1/5 + 1/6 + 1/18`、`(mxd − d) × (1/mina) < a/b − v`。原文 `v` 与 `(x, y)`、`mina` 的说明不一致处保留并附编者待核说明，没有改写为臆测的算法规格。 |
| Dynamic-Programming.pdf | 9–15、23、28 | `10^7`、`10^9`、`10^18`，状态下标、递推和初始条件。初始条件保持到原动画页才出现；第 12–15 页是首尾不相邻假设下的线性递推，不能直接解决原环形问题。 |
| destiny.pdf | 3–5 | 去除样例灰色行号与框线；样例 2 保留第 3 页 6 行、第 4 页 16 行的跨页边界；展开 25 行子任务表，恢复两个 `10^5`。 |

新增回归先在旧正文上失败，再在修订正文上通过。测试从 MCP 返回的真实页段取得两组 destiny 输入，独立枚举边的所有 0/1 赋值，检查每个约束路径至少有一条重要边，分别得到原样例答案 8 和 960；这也防止行号重新混入输入。Search 两个分数等式另用有理数运算核对。上述检查不等于全题算法或整份讲义已验证。

固定链接与完整来源 ID 见下方逐文件表；原件及旧页段哈希、逐页转录和核对理由保存在 `sources/wzj52501/corrections.json`。

## 未完成项与下一批

1. 上下标结构：P₂、i₂、Sₙ 仍可能被扁平化为 P2、i2、Sn；10 的数字幂也存在静默拼接。下表上标候选仅是原页核对导航，不是可自动采用的恢复答案。
2. 分数、求和上下界、复杂公式、图表：Search 43–48 已逐页恢复，其余未修页仍不能当作完整公式。
3. 题面样例行号与数据混排：destiny 第 3–4 页已分离行号；其他题面的圆角恢复不代表样例可以直接复制运行。
4. DOCX/PPTX 图片公式不属于本次 PDF 批量修复，bishop-solution.docx 段落 3 仍缺复杂度公式。

全库上标候选扫描得到 494 个候选片段；visitor_text 坐标会滞后，真实上标也可能表现为下降，故未按启发式批量改写。下一批应按固定来源、物理页与页段哈希核对后修订；优先常用讲义的约束和复杂度，再处理题面样例与复杂公式。

## 逐文件覆盖

“异常”仅统计控制码、CID、PUA、替代字符。零异常不等于公式完整。自动页数已扣除视觉修订页，上标候选列也去除了已完成的视觉修订页；其余页仍需版式复核。

| 来源与文件 | 总页数 | 自动变化页 | 显式异常前→后 | 上标候选物理页（待核对） |
|---|---:|---:|---:|---|
| `wzj52501-1a006168de90deb9`<br>[Lectures/Advanced-Data-Structures.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Advanced-Data-Structures.pdf) | 123 | 123 | 58 → 0 | 14, 15, 16, 17, 18, 19, 20, 21, 27, 28, 29, 30, 31, 32, 33, 61, 62, 63, 68, 69, 70, 71, 72, 77, 78, 79, 83, 84, 86, 92, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114 |
| `wzj52501-57b750702384943e`<br>[Lectures/Computational-Geometry.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Computational-Geometry.pdf) | 81 | 81 | 56 → 0 | 58, 59, 60, 61, 62, 66, 67, 71, 72, 73, 74, 75, 76, 77, 78, 79 |
| `wzj52501-14c1aebd385d0898`<br>[Lectures/Data-Structures.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Data-Structures.pdf) | 102 | 102 | 47 → 0 | 14, 15, 16, 17, 18, 19, 20, 21, 27, 28, 29, 30, 31, 32, 33, 46, 61, 62, 63, 68, 72, 77, 78, 79, 84, 85, 87, 88, 89, 90, 91, 97, 98, 99, 100, 101 |
| `wzj52501-bef09e38cffed149`<br>[Lectures/Dynamic-Programming-Talk.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Dynamic-Programming-Talk.pdf) | 66 | 66 | 46 → 0 | 4, 5, 6, 7, 8, 9, 10, 11, 12, 34, 56 |
| `wzj52501-6cc8051f4f4f2148`<br>[Lectures/Dynamic-Programming.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Dynamic-Programming.pdf) | 120 | 110 | 21 → 0 | 29, 30, 31, 58, 89, 104, 107, 115 |
| `wzj52501-8032cd13a26e9252`<br>[Lectures/Graph-Fun-Problems.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Graph-Fun-Problems.pdf) | 11 | 11 | 1 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-8beb95e45226db3c`<br>[Lectures/Graph-Misc-Problems.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Graph-Misc-Problems.pdf) | 71 | 71 | 46 → 0 | 12, 13, 14, 15, 16, 17, 25, 26, 44, 51, 56, 62 |
| `wzj52501-78defa026b502528`<br>[Lectures/Graph-Theory-and-Applications.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Graph-Theory-and-Applications.pdf) | 142 | 142 | 65 → 0 | 54, 55, 56, 57, 58, 59, 60, 116, 124, 125, 130, 137 |
| `wzj52501-a8fd52b507f9d981`<br>[Lectures/Minimum-Spanning-Tree.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Minimum-Spanning-Tree.pdf) | 72 | 72 | 34 → 0 | 12, 13, 14, 15, 16, 17, 27, 55, 60, 61 |
| `wzj52501-47ea6aed45898608`<br>[Lectures/Misc-Problems-Overview.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Misc-Problems-Overview.pdf) | 60 | 60 | 13 → 0 | 3, 12, 20 |
| `wzj52501-0a2d591afe24e5b7`<br>[Lectures/NOIP-2018-Problems.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/NOIP-2018-Problems.pdf) | 75 | 75 | 49 → 0 | 8, 14, 15, 16, 21, 25 |
| `wzj52501-56f28959e9c51d43`<br>[Lectures/NOIP-Dynamic-Programming.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/NOIP-Dynamic-Programming.pdf) | 49 | 49 | 10 → 0 | 27 |
| `wzj52501-5cedd8beba73f8c3`<br>[Lectures/NOIP-Preparation.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/NOIP-Preparation.pdf) | 59 | 59 | 46 → 0 | 10, 17, 18, 19, 24, 28, 38, 39, 40, 44, 45, 46, 47, 48, 49, 50, 51 |
| `wzj52501-56daca84def58c58`<br>[Lectures/Number-Theory.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Number-Theory.pdf) | 65 | 65 | 39 → 0 | 34, 35, 36, 37, 53, 54, 55, 56 |
| `wzj52501-230181316075b1b5`<br>[Lectures/Rare-Tricks.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Rare-Tricks.pdf) | 64 | 64 | 36 → 0 | 6, 15, 23, 50, 51, 52, 53, 54, 55, 56 |
| `wzj52501-2fd4e11ab81b2b16`<br>[Lectures/STL-and-Applications.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/STL-and-Applications.pdf) | 67 | 67 | 19 → 0 | 28, 29, 30, 31, 32 |
| `wzj52501-0f0daa9b82cfef46`<br>[Lectures/Search.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Search.pdf) | 52 | 43 | 12 → 0 | 20, 21 |
| `wzj52501-26bc66f176222b6e`<br>[Lectures/Strategy.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Lectures/Strategy.pdf) | 49 | 49 | 43 → 0 | 4, 5, 6, 7, 8, 9, 17, 21, 27, 38, 44 |
| `wzj52501-9d0fc4ce42a7447e`<br>[Setter/BJTSC/Day1/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day1/solutions.pdf) | 46 | 46 | 23 → 0 | 6, 7, 8 |
| `wzj52501-71f6afeeedcb238c`<br>[Setter/BJTSC/Day1/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day1/statements.pdf) | 7 | 0 | 0 → 0 | 3, 5, 7 |
| `wzj52501-0d08ff8a5b5b46a5`<br>[Setter/BJTSC/Day2/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day2/solutions.pdf) | 44 | 44 | 6 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-c8a168ebef0d2cdf`<br>[Setter/BJTSC/Day2/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day2/statements.pdf) | 4 | 0 | 0 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-854d948f8b6f5966`<br>[Setter/BJTSC/Day3/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day3/solutions.pdf) | 31 | 31 | 10 → 0 | 9, 10 |
| `wzj52501-e9767d38e0588dba`<br>[Setter/BJTSC/Day3/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day3/statements.pdf) | 4 | 0 | 0 → 0 | 2, 4 |
| `wzj52501-2823b950197c9b26`<br>[Setter/BJTSC/JointProvincialSel2020_Final/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/JointProvincialSel2020_Final/solutions.pdf) | 9 | 9 | 6 → 0 | 6 |
| `wzj52501-a1ee1ebc50fef4f7`<br>[Setter/BJTSC/JointProvincialSel2020_Final/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/JointProvincialSel2020_Final/statements.pdf) | 4 | 0 | 0 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-1c5d79f6f024de89`<br>[Setter/BJTSC/Mock-1/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Mock-1/statements.pdf) | 4 | 0 | 0 → 0 | 1, 2, 3, 4 |
| `wzj52501-bfe1bc7b26712a09`<br>[Setter/BJTSC/Mock-2/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Mock-2/solutions.pdf) | 21 | 21 | 6 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-61c3a519fea2b2b8`<br>[Setter/BJTSC/Mock-2/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Mock-2/statements.pdf) | 4 | 0 | 0 → 0 | 1 |
| `wzj52501-8c2774dd50231e4c`<br>[Setter/NOI/Mock-1/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-1/solutions.pdf) | 65 | 65 | 33 → 0 | 3, 20 |
| `wzj52501-16fe3700cac34333`<br>[Setter/NOI/Mock-1/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-1/statements.pdf) | 4 | 1 | 1 → 0 | 1, 2, 3, 4 |
| `wzj52501-15fe5bb7d99c295d`<br>[Setter/NOI/Mock-2/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-2/solutions.pdf) | 27 | 27 | 21 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-4e18433faccd539f`<br>[Setter/NOI/Mock-2/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-2/statements.pdf) | 4 | 3 | 3 → 0 | 1, 3 |
| `wzj52501-1722249f1bebd56c`<br>[Setter/NOI/Mock-3/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-3/statements.pdf) | 6 | 1 | 1 → 0 | 3, 4, 5 |
| `wzj52501-59a964539340d224`<br>[Setter/NOI/Mock-4/cruise-solution.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-4/cruise-solution.pdf) | 2 | 0 | 0 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-35970b61b66ee000`<br>[Setter/NOI/Mock-4/exploit-solution.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-4/exploit-solution.pdf) | 1 | 0 | 0 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-a1d38690b886c1b3`<br>[Setter/NOI/Mock-4/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-4/statements.pdf) | 6 | 2 | 2 → 0 | 1, 2, 3, 4 |
| `wzj52501-bd625520387cf014`<br>[Setter/NOI/Mock-4/zoo-solution.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-4/zoo-solution.pdf) | 1 | 1 | 1 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-04cdc0e7a1942910`<br>[Setter/NOI/Practice-1/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Practice-1/solutions.pdf) | 28 | 28 | 8 → 0 | 9, 10, 25 |
| `wzj52501-3894228b3d6a6bd7`<br>[Setter/NOI/Practice-2/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Practice-2/solutions.pdf) | 38 | 38 | 29 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-0f316880abbe14e4`<br>[Setter/NOI/Practice-2/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Practice-2/statements.pdf) | 6 | 1 | 1 → 0 | 4, 5 |
| `wzj52501-9efd5abc5b968d9c`<br>[Setter/NOI/noi2020-final/destiny.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/destiny.pdf) | 5 | 1 | 4 → 0 | 无剩余上标候选；其他排版仍需核对 |
| `wzj52501-893548856ebaaaa7`<br>[Setter/NOI/noi2020-final/dish-solution-alt.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/dish-solution-alt.pdf) | 11 | 11 | 8 → 0 | 3 |
| `wzj52501-d3f4bd99c50c2d3b`<br>[Setter/NOI/noi2020-final/dish-solution.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/dish-solution.pdf) | 7 | 7 | 4 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-53880c3366cdf06d`<br>[Setter/NOI/noi2020-final/dish.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/dish.pdf) | 4 | 0 | 0 → 0 | 4 |
| `wzj52501-ba5ceed59ea76659`<br>[Setter/NOI/noi2020-final/problem.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/problem.pdf) | 3 | 2 | 2 → 0 | 3 |
| `wzj52501-82e627ac1cb17bc8`<br>[Setter/NOI/noi2020-final/surreal.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/surreal.pdf) | 8 | 7 | 6 → 0 | 5, 7 |
| `wzj52501-89a2fdad9d69a2f8`<br>[Setter/NOIP/Mock-1/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-1/solutions.pdf) | 32 | 32 | 23 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-4c6f43aabc44516e`<br>[Setter/NOIP/Mock-1/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-1/statements.pdf) | 5 | 0 | 0 → 0 | 1, 4, 5 |
| `wzj52501-e5689f59098881d3`<br>[Setter/NOIP/Mock-2/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-2/solutions.pdf) | 26 | 26 | 15 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-36ba1ce7633698b3`<br>[Setter/NOIP/Mock-2/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-2/statements.pdf) | 5 | 0 | 0 → 0 | 1 |
| `wzj52501-89f4ffe2af779dee`<br>[Setter/NOIP/Mock-3/solutions.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-3/solutions.pdf) | 30 | 30 | 15 → 0 | 未检出；不代表没有上下标 |
| `wzj52501-d4129b2b66575288`<br>[Setter/NOIP/Mock-3/statements.pdf](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-3/statements.pdf) | 4 | 1 | 1 → 0 | 1, 2, 4 |

复查统计：`python scripts/audit-pdf-extraction.py`；重建步骤见 [资料库 README](../sources/wzj52501/README.md)。
