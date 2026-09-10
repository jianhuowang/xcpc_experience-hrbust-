# exp 只读 MCP 实施计划

> 使用 subagent-driven-development 分工实现并复核；用户已确认只读 MCP、复习入口和真实旧题验收范围，并于 2026-09-10 要求开始。

**目标：** 给网页 ChatGPT 提供协会经验与固定外部资料的按需检索、引用能力。

**架构：** 复用知识 Frontmatter 解析器和外部清单校验器；新增目录读取模块与两个 MCP 工具。使用官方 MCP SDK 的无状态 Streamable HTTP，Node.js 22+，不用数据库、向量索引或模型 API。服务只读，默认绑定 127.0.0.1；网页端通过 HTTPS 转发或官方 Secure MCP Tunnel 连接。公共连接只提供仓库允许分发的知识，不携带个人复习记录。

## 已确认的设计与约束

- `search` 查询目录元数据；`fetch` 按稳定 ID 和定位读取。始终先查目录再读候选，首版不支持整库正文搜索。中英文主题使用少量明确同义词映射，不生成摘要或伪造命中。
- `mode` 为 `H1` / `H2` / `H3` / `reference`，缺省 H1。H1/H2 返回元数据，不输出任何候选正文；这是当前没有已核验安全页清单时的保守实现。reference 用于用户明确的通用资料查询，可读讲义和协会经验；题面、直接题解与代码须 H3。模型不得自行把盲做升级为 reference/H3。
- mode 是调用方声明，不是用户身份认证或不可绕过的授权证明；协议检查能拦截错误参数，但仍须真实 Agent 验收调用行为。
- 外部来源采用原 manifest 的完整 ID、固定链接、许可、署名、状态、警告；不得把 extracted 当作技术核验。withheld/failed 仅元数据。损坏符号保持原样。
- PDF 使用物理页；PPTX 使用幻灯片；DOCX 使用段落/表格；代码与 Markdown 使用原始行。每次最多 5 页、10 段或 100 行，正文最多 16000 字符，截断必须说明。
- 客户端只能提交 ID，不能提交路径或下载 URL。启动时限制并核验允许读取的文件，非法清单直接失败；缺失整个外部目录则明确 external_available=false。
- 协会知识固定到启动时 Git HEAD，若知识有未提交变更则拒绝启动，避免固定链接与内容不符。active 标签不作为服务端审核证明；返回 knowledge_revision，正式部署必须选合并后的 main。
- 个人复习继续使用“acm复习训练”的既有记录和流程；不修改 Trainer、排程、历史聊天、自动提醒或真实训练数据。

## 任务 1：目录与定点读取

文件：`mcp/catalog.mjs`、`tests/mcp-catalog.test.mjs`。

接口：`loadCatalog(root)` 返回 `{search(args), fetch(args), externalAvailable, revision}`。
`search({query, mode='H1', scope='all', limit=10, offset=0})`：scope=all/association/external；匹配 ID/标题/路径/主题元数据；返回 `{results, total, offset, external_available, knowledge_revision, note}`。结果项至少 `{id,title,url,layer,status,role,format,units,warnings}`。
`fetch({id,mode='H1',unit,start=1,count})` 返回 `{id,title,url,text,metadata}`；metadata 含完整来源信息、定位、访问结果、截断标识、是否直接题解及当前版本。外部无正文、H1/H2 禁止正文、未知 ID 分别返回明确状态，禁止假装“无命中”。

- [x] 先写实际固定快照测试并观察缺失实现失败：__int128 命中、最小费用最大流协会零命中、Search 中文同义词、withheld、未知 ID、H1/H2 不泄露正文、H3 两份来源分别定位、非法定位/路径、损坏字符保留。
- [x] 实现并通过 `node --test tests/mcp-catalog.test.mjs`。复用 `parseDocument` / `validateLibrary`；协会文件用 Git 固定快照枚举，避免混入未提交内容。
- [x] 核对 PDF 页/段落/行切片不串页，不把转录头部当作正文。

## 任务 2：MCP HTTP 服务

文件：`mcp/server.mjs`、`tests/mcp-server.test.mjs`、`package.json`、`package-lock.json`、`.gitignore`、`.github/workflows/validate.yml`。

接口：`createHttpServer({catalog, instructions, allowedHosts, allowedOrigins})` 返回 Node HTTP Server；`createMcpServer(catalog,instructions)` 注册 search/fetch；CLI `npm run start:mcp` 绑定 127.0.0.1:3001，环境变量 `PORT`/`HOST`/`MCP_ALLOWED_HOSTS`/`MCP_ALLOWED_ORIGINS` 控制部署入口。无静态文件路由，GET /health 返回健康状态，/mcp 使用 SDK。

- [x] 安装锁定版本的 `@modelcontextprotocol/sdk` 与 `zod`。官方协议库处理初始化、通知和传输，不手写 JSON-RPC 框架。
- [x] 先测试真实 HTTP initialize、tools/list、tools/call、无效参数、只读注解、Origin/Host 拒绝、无任意文件读取，再实现服务。
- [x] MCP 返回 structuredContent 和同值 JSON 文本，保留 URL 供引用。读取根 AGENTS 的资料规则作为 server instructions，追加明确工具使用说明。
- [x] 限制请求体 64 KiB、返回体段落上限、请求超时；GET/DELETE 不支持长连接会话时返回 405，不维持用户状态。
- [x] CI 先 npm ci，再保留现有全部测试/校验。

## 任务 3：日常入口、连接与交付

文件：`docs/mcp-usage.md`、`README.md`、`AGENTS.md`。

- [x] 说明启动、真实 HTTPS 地址来源、无身份验证仅适用于公开只读库、停止服务方式、更新后重启。绝不把 localhost/仓库地址或占位域名说成已上线连接。
- [x] 提供给“acm复习训练”的增量指令：先盲做，求提示才检索，明确 H3 才读题解；个人掌握度与协会知识分开，AC 不等于独立完成；个人复盘不自动投稿。
- [ ] 自动验收完成后实测公开转发（环境支持时），给用户完整表单和真实测试 URL；长期托管选择单独说明。不给测试地址承诺长期可用。
- [x] `npm test`、`npm run validate`、`npm run validate:library`、`git diff --check`；独立代码复核，修复阻断项。真实 ChatGPT 中的提示/复盘测试由用户执行，不能用本地 SDK 测试冒充。

## 当前记录

- 2026-09-10：从 main eb04912 创建 feat/readonly-mcp，原目录保持干净；基线 28/28、5 条知识、135 份外部清单校验通过。
- 公开 OpenAI 文档 MCP 已由用户创建并成功调用。这证明其账户支持该连接，不代表 exp 服务已部署或项目内全部行为已验收。
- 2026-09-10：实现后 45/45 测试通过，5 条知识与 135 份外部清单校验通过；官方 SDK 本机真实 HTTP 验收通过。独立审查发现并修复大量请求头导致 Origin 被丢弃、纯符号查询误匹配全库的问题，回归测试已覆盖；最终审查无阻断项。
- 网页 ChatGPT 的连接发现、H1/H3 参数选择与个人复盘行为仍待用户实际验收。
- 用户已选择 Render 免费实例：补充 `render.yaml`，仅部署一个原生 Node 免费服务；使用平台实际域名作为 Host 白名单，main CI 通过后更新。先完成 PR，再由用户登录 Render 连接仓库；实际 Live 状态、公网 SDK 和 ChatGPT 验收仍分别记录，不以配置文件存在替代上线证明。
- 2026-09-10 公网验收未通过：本机 `127.0.0.1:3301/mcp` 的完整 SDK 检查成功；两次 Cloudflare Quick Tunnel 注册成功后，新域名仍返回 DNS 不存在，指定 Cloudflare 地址探测返回 1016。未向用户交付已验证公网 URL；不将该问题记为代码测试失败或已完成网页接入。后续先恢复可用 HTTPS 入口，再运行 `scripts/check-mcp.mjs`，最后进行真实 ChatGPT 验收。
