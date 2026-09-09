# 外部全量资料库接入验收

日期：2026-09-09。范围：固定版本 `wzj52501/awesome-competitive-olympiad-algorithms@7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e` 的全文件清单、转录、索引与维护工具。不是逐题算法审核，也没有新增协会 active 经验。

## 数据与自动检查

- GitHub 完整 Git tree（`truncated: false`）与 135 项清单逐个对照，路径、大小、Git blob SHA1 全部一致。格式为 66 PDF、49 C++、6 DOCX、3 PPTX、9 Markdown 和两个辅助文本。
- 状态：52 extracted、60 needs-review、17 withheld、6 metadata；无 failed。118 份转录可检索；17 份来源待核文档保留元数据，未分发正文。没有声称完成全库 OCR 或公式修复。
- 两次离线导入到不同目录：122 个生成文件逐字节一致（118 转录、清单、索引、两份许可）。不含手写 README。`sources/** -text` 防止 Git 换行转换改变原代码与转录哈希。
- `npm test`：28/28；`npm run validate`：5 个协会条目通过；`npm run validate:library`：135 项通过。
- Python unittest：10 项，9 通过；1 项真实悬空符号链接测试因本机 Windows 无创建权限跳过，Ubuntu CI 将运行该测试。测试覆盖真实 PDF/DOCX/PPTX、异常字符、原文保留、重复来源、归档增删篡改、输出越界及禁发正文残留。
- `npm run build-index`、`npm run bundle` 均通过，现有协会索引与两条 active 知识包内容无变化。
- 复核发现并修复：伪造固定版本归档可被接受、withheld/failed 旧正文残留未拦截、原始许可缺失或篡改未校验。
- 拆分后第二轮独立审查发现：许可文件与清单 SHA256 同时修改时，旧检查仍可能通过。已增加许可实际字节的 Git blob SHA1 校验，将其绑定到固定树摘要；同步篡改回归先失败，修复后通过。

路径与 blob 的固定摘要为 `9b62c53007461516a51835246de04464a91f18c58f31f0b2e4914183468dfd00`，计算规则：按原路径排序，拼接 `path + NUL + git_blob_sha1 + LF` 的 UTF-8 字节，取 SHA256。导入器及分发校验均核对该摘要。

## 本 PR 的验收边界

PR #11 只验收资料文件、提取工具、索引、许可与完整性校验。AGENTS.md 仅增加资料维护职责，Skill 与原有协会知识包保持原样。目录已提供浏览入口，但不据此宣称 Agent 自动检索或 H1/H3 行为已经接入。

之前 Codex 与 WorkBuddy 的检索记录以及公式补猜、H1 边界等问题，随检索协议移到下一步 PR 的独立验收记录。客户端行为验证不作为本资料 PR 已完成的检查项。
