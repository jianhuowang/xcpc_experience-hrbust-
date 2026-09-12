# wzj52501 外部算法资料库

这是固定版本的外部资料检索层，不属于协会已审核经验。先读 [索引](index.md)，再按 [清单](manifest.json) 中的 `text_path` 阅读相关页段；引用时附来源 ID、原文件链接与定位。不要一次把整个正文目录加载到对话中。

来源：[awesome-competitive-olympiad-algorithms](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/tree/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e)，固定提交 `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`。已登记该版本完整的 135 个文件：52 extracted、60 needs-review、17 withheld、6 metadata，无 failed。118 份提供转录，17 份仅提供元数据。后续更新需要明确更换快照并重新核对，不能把上游 main 的新增内容默认为本库已有。

## 怎么查

在完整 exp 仓库中启动 Agent，按根目录 [AGENTS.md](../../AGENTS.md) 的检索规则操作。仅安装用户级 Skill 不会复制这里的资料。

目录定位可从这些中英文词开始：搜索／search／DFS，动态规划／dynamic programming／DP，图论／graph，数据结构／data structures，数论／number theory。它们是检索别名，不保证任意题目都被对应讲义覆盖；进入候选文档后核对实际内容和适用条件。

本批明确提供搜索和 DP 讲义的转录，例如 `Lectures/Search.pdf` 与 `Lectures/Dynamic-Programming.pdf`；不是只有之前试用的三个经验摘要。题面、题解和代码按原路径保留来源，目录分组不等于已经核实同题。H1/H2 盲做先查看目录，避免搜索或读取目标题解；用户明确请求 H3 后才能使用直接题解，并披露来源。

## 状态与证据

| 状态 | 可以如何使用 |
|---|---|
| extracted | 已提取文本／代码，可检索引用；不表示算法已验证 |
| needs-review | 有可检索文字，但公式、图片或排版可能丢失；关键论证必须核对原页 |
| withheld | 来源或许可需要进一步核实，只提供元数据和上游链接 |
| failed | 提取失败，记录原因；不能称该文件已完成正文接入 |
| metadata | 许可、目录等辅助资料，不作为独立算法结论；含解法信息的 Setter 验题反馈归为 solution |

PDF 采用物理页码，DOCX 采用段落／表格定位，PPTX 采用幻灯片序号。转录不是人工重写的题解，未做全库 OCR，也未逐题验证算法。部分 PDF 的乘号、比较符、减号及上下标会失真；DOCX/PPTX 的图片公式不会因提取出了周围文字就变完整。

清单保留原文件 SHA256 与 Git blob SHA1，转录正文另有 SHA256；完全重复文件用 `duplicate_of` 关联，并保留各自 ID。相似题、版本变体和动画重复页不能计作多份独立证据。

本批核实三组字节重复：BJTSC/Day3 与 NOI/Practice-1 的 `arcana.cpp`、`stone.cpp`，以及 NOI/Mock-3 与 NOI/Practice-2 的 `conference.cpp`。内容核查还确认：`noi2020-final/dish.docx`、`dish.pdf` 是同题不同格式，两个 `dish-solution*.pdf` 保留不同版本；Mock-3 与 Practice-2 的 bishop、conference、decoration 对应同题。`original-solution.{docx,pdf}` 对应 `original-0619pro.pdf`，不与另一套 `original-problem.pdf` 混为一组。这些关系帮助导航，不增加独立证据数量。

## 许可与逐文件来源核查

上游代码使用 [MIT](licenses/LICENSE)，文档内容使用 [CC BY-NC-SA 4.0](licenses/CONTENT-LICENSE.md)。转录与改编保留原作者和上游链接，并沿用适用许可；不是将整库改为本项目原创内容。清单中的 attribution 记录核查到的署名，上游概括性 README 不覆盖逐文件不同署名。

以下 17 份文档存在第三方署名或来源不明确，正文暂缓发布，完整元数据仍在清单中：

- 两份 `Basic-Algorithms_cjl.pdf`、`Basic-Data-Structures_cjl.pdf`：陈嘉乐。
- 三份 `Problem-Exchange-*.pptx`：zsy、zsy、罗剑桥。
- `Lectures/Misc-Problems/` 下七份 PDF：洪华敦／季雨田、许靖、王恒屹、任轩笛／孙耀峰、王子健／颜开、颜开／王子健、程超然／杨昊翔；详见逐文件 attribution。
- `Self-Selected-Problems.pdf`：封面 wzj52501，内文另有尹涵、杨卓毅、钟子谦等署名。
- `Setter/NOI/noi2020-final/` 下的 `original-0619pro.pdf`、`original-solution.pdf`、`original-solution.docx`：Chloe_fan／613；`original-problem.pdf` 仅见 RHL 等来源线索。

另外，`surreal-README.md` 明确 `surreal.cpp` 为 O(mn) 暴力且因弱数据得到满分。因此本库统称“上游代码”，不保证每一份都是满足理论最优复杂度的标准答案。`original-bbf.cpp` 的作者未独立核实，不能由文件名前缀推断它与哪份历史题面对应。

## 获取、重建和检查

### 批量提取修复与局部视觉修订

全部 53 份允许提取的 PDF 都经过字体和可见性修复流程。导入器读取内嵌 CFF 编码补全缺失的 Unicode 映射，保留已有正确映射；对私用区字形使用已核对的字形证据。证据见 `pdf-symbol-evidence.json`，不是按控制码全局猜符号。PDF 原件不改写。

逐文件覆盖、实际视觉抽查和公式结构待办见 [本轮验收记录](../../docs/acceptance-pdf-batch.md)。显式异常清零不代表上下标、分数、图片或样例排版已完整恢复。

不可见文字仅在透明度恰为零、明确不绘制，或水平/轴对齐且整体位于页面之外时过滤，并保留原文字推进位置。未知字体、复杂变换、Form 和其他裁剪情况保留并警告。页内“自动提取修复”不代表逐页视觉审核；上下标、分数、表格、图片等仍可能失真，状态仍为 needs-review。

`corrections.json` 保存按原件页图核对的局部修订，默认由导入命令应用。每项绑定来源 ID、原路径、原件 SHA256、物理页码与原始提取页段 SHA256；哈希不匹配、页码不存在、重复修订或 withheld 来源会拒绝导入。不要直接编辑生成的 `text/`，否则下次重建会覆盖。

首批为 Search.pdf 第 11、41、42 页与 Dynamic-Programming.pdf 第 8 页。页内标注“视觉转录修订”，清单保留 needs-review。修订是 Codex 对原页的转录，需随 PR 审核；不是协会算法审核，也没有全库 OCR。未修页不因相邻页修复而自动成为可信正文。

第二批补充 18 页：Search.pdf 第 43–48 页的分数和剪枝公式；Dynamic-Programming.pdf 第 9–15、23、28 页的指数、下标和递推；destiny.pdf 第 3–5 页的样例与子任务表。累计 22 页有视觉修订，均经过独立原图复核。Search 的原文变量歧义保留为编者待核说明；DP 第 12–15 页明确以首尾不相邻为假设，不能当作环形问题的完整解法。destiny 样例 2 仍按原物理页拆分，复制完整输入需取第 3、4 页。

已确认的特殊问题：Search 第 41 页的旧提取含隐藏动画文字，估价函数段落实际在第 42 页显示；DP 第 8 页的上标 `10^7` 原先被静默提取成 `107`。bishop-solution.docx 的嵌入公式仍待处理，不能把 PDF 修复泛化为 DOCX 已修复。复核记录见[首批修订记录](../../docs/acceptance-extraction-repair.md)。

如需复现最初的原始结果，使用 Python 导入模块的 `import_archive(archive, output, corrections=[], pdf_repairs=False)` 写到单独临时目录。CLI 的 `--corrections` 指向 `[]` 仅停用视觉修订，仍执行自动修复。默认修订文件缺失时 CLI 会报错，避免悄悄退回旧正文。旧视觉修订的哈希始终按自动修复之前的原始提取校验。

### 重建命令

查询已提交的转录不需要 Python、PDF 解析器或 GitHub CLI；维护者重建时使用 Python 3.12+ 和 `scripts/requirements-library.txt` 中固定版本的 pypdf、fontTools，DOCX/PPTX 处理使用 Python 标准库。脚本只读源文件，不编译或执行上游代码。

```powershell
python -m pip install -r scripts/requirements-library.txt
python scripts/import-library.py --help
python scripts/import-library.py fetch
python scripts/import-library.py import
npm run validate:library
python -m unittest discover -s tests -p 'test_*.py'
python scripts/audit-pdf-extraction.py
```

在仓库根目录执行，默认缓存位于忽略的 `.cache/library/`，正文和清单位于本目录。也可以通过导入命令的 `--archive` 指定已经获取的固定 ZIP。原始二进制文件不提交进 exp；核对原图时按清单固定链接获取。

导入器与 `npm run validate:library` 都固定校验原路径与 Git blob SHA1 清单摘要，拒绝冒用版本号、增删文件或篡改归档。更新快照时须从对应 Git tree 独立核实后，同时更新 Python 和 Node 中的 commit 与摘要常量。校验另检查 ID、路径、状态、重复关联、原始许可及转录哈希；withheld/failed 对应位置若残留旧正文会报错，维护者核实后显式处理，不自动删除文件。

这些检查不能证明原文算法正确。修改源接入脚本时还运行 `npm test`、`npm run validate` 和 Python 回归。普通 Chat 知识包本轮不增加这些外部全文。资料校验见[数据验收记录](../../docs/acceptance-full-library.md)，客户端验证与待验收项见[Agent 验收记录](../../docs/acceptance-external-agent.md)。
