# Experience 语义校验与知识包一致性实施记录

目标：完成 Issue #8 的本地治理规则；校验和打包接受相同的 Frontmatter 与目录结构。用户已暂停 Trainer，此轮不改 Trainer。

沿用 2026-09-04 设计。新增共享模块仅搬出两个脚本实际共用的目录扫描与 Frontmatter 解析，不增加依赖或迁移知识目录。

实现边界：

- related 按稳定 ID 在输入知识目录中查找，允许关联 deprecated，禁止不存在、自引用和跨子目录重复 ID。
- active 必需章节不能以 TODO、TBD、待补充、替换为开头；deprecated 示例仍可保留占位文本。
- topics 每项使用小写英文/数字 kebab-case，禁止重复和空项。
- 两个命令共用递归扫描与引号解析；重复 Frontmatter 字段报错。打包保留子目录来源路径并转义 URL 路径段。
- 命令不解释完整 YAML，继续使用单行 key: value 子集；不新增网站、MCP、RAG 或自动内容审核。
- GitHub 分支保护与 Issue 关闭属于后续发布工作，本轮不执行。

执行顺序：

1. 在 `tests/validate.test.mjs` 添加上述语义反例，在 `tests/bundle.test.mjs` 验证引号、子目录和重复身份，并确认旧实现失败。
2. 新增 `scripts/knowledge.mjs` 复用现有扫描与解析；修改 `scripts/validate.mjs`、`scripts/bundle.mjs` 的调用点。
3. 更新投稿 Schema、PR 模板与 README 中的治理说明。
4. 执行 `npm test`、`npm run validate`、`npm run bundle`、`git diff --check`；生成包应与当前版本保持一致。

验收：现有 5 条知识全部合法，生成包仅包含 2 条 active；新增坏输入通过 CLI 被拒绝，子目录与引号字段正常打包且输出稳定。

2026-09-08 状态：已完成。18 项回归通过、5 条知识校验通过，知识包重建内容未变；已同步 Schema、PR 模板和 README，独立只读复核无必须修改项。远程分支保护、发布及 Issue 关闭未执行。
