import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { knowledgeFiles, parseDocument } from "./knowledge.mjs";

const knowledgeRoot = resolve(process.argv[2] ?? ".agents/skills/xcpc-experience-coach/references/knowledge");
const outputPath = resolve(process.argv[3] ?? ".agents/skills/xcpc-experience-coach/references/knowledge-index.md");

// 复用完整校验，失败时保留旧索引，不维护第二套 Schema 规则。
const validation = spawnSync(process.execPath, [fileURLToPath(new URL("./validate.mjs", import.meta.url)), knowledgeRoot], { stdio: "inherit" });
if (validation.error) throw validation.error;
if (validation.status !== 0) process.exit(validation.status ?? 1);

// 标题和元数据仅作为文本展示，避免条目中的 Markdown/HTML 改写索引结构。
function escapeText(text) {
  return text.replace(/[&<>\[\]|`*_\\]/g, (char) => `&#${char.charCodeAt(0)};`);
}

const entries = knowledgeFiles(knowledgeRoot).map((path) => {
  const { fields, body } = parseDocument(readFileSync(path, "utf8"));
  return {
    ...fields,
    topics: fields.topics.split(",").map((topic) => topic.trim()).filter(Boolean),
    id: basename(path, ".md"),
    title: body.match(/^(?:[ \t]*\r?\n)*#[ \t]+([^\r\n]*)/)?.[1] ?? basename(path, ".md"),
    link: relative(dirname(outputPath), path).split(sep).map((part) =>
      encodeURIComponent(part).replace(/[()]/g, (char) => `%${char.charCodeAt(0).toString(16)}`),
    ).join("/"),
  };
});

function groupSection(title, field) {
  const values = (entry) => field === "topics" ? entry.topics : [entry[field]];
  const groups = [...new Set(entries.flatMap(values))].sort();
  return `## ${title}\n\n` + groups.map((group) => {
    const rows = entries.filter((entry) => values(entry).includes(group)).map((entry) =>
      `| [${escapeText(entry.id)}](${entry.link}) | ${escapeText(entry.title)} | ${entry.status} |`,
    );
    return `### ${escapeText(group)}\n\n| 条目 ID | 标题 | 状态 |\n|---|---|---|\n${rows.join("\n")}\n`;
  }).join("\n");
}

const active = entries.filter((entry) => entry.status === "active").length;
const output = `# 经验知识索引

由 \`npm run build-index\` 生成，不手工编辑。维护者在合并后统一刷新索引和知识包。

本索引包含 ${entries.length} 条知识：${active} 条 active、${entries.length - active} 条 deprecated。

索引仅用于导航；文件中的 active 标记不代表 PR 已审核。请以 main 和 PR 审核记录为准。
deprecated 仅保留历史，不作为默认经验推荐；按类型和主题浏览时也须检查状态。
索引可能落后于源文件，投稿前仍需检索 knowledge/ 并阅读相关条目全文。

${entries.length ? [groupSection("按状态", "status"), groupSection("按类型", "kind"), groupSection("按主题", "topics")].join("\n") : "当前没有知识条目。\n"}`;

writeFileSync(outputPath, output, "utf8");
console.log(`Indexed ${entries.length} knowledge entries into ${outputPath}.`);
