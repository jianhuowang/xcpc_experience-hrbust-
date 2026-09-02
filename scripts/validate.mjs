import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const knowledgeRoot = resolve(process.argv[2] ?? ".agents/skills/xcpc-experience-coach/references/knowledge");
const allowedFields = new Set(["kind", "topics", "evidence", "authors", "reviewers", "status", "updated", "related"]);
const requiredFields = ["kind", "topics", "evidence", "authors", "reviewers", "status", "updated"];
const enums = {
  kind: ["algorithm", "implementation", "debugging", "contest", "team", "training"],
  evidence: ["single-case", "repeated-practice", "source-backed", "team-consensus"],
  status: ["active", "deprecated"],
};
const commonHeadings = ["经验结论", "适用信号", "常见 blocker 或失败症状", "原因与原理", "验证方式", "边界与反例", "来源"];
const typeHeadings = {
  algorithm: ["核心模型或不变量", "复杂度与约束", "实现风险", "迁移识别"],
  implementation: ["核心模型或不变量", "复杂度与约束", "实现风险", "迁移识别"],
  debugging: ["核心模型或不变量", "复杂度与约束", "实现风险", "迁移识别"],
  contest: ["技术层复盘", "团队信息层复盘", "现场决策层复盘", "应保留的做法", "下一次实验"],
  team: ["技术层复盘", "团队信息层复盘", "现场决策层复盘", "应保留的做法", "下一次实验"],
  training: ["暴露的问题", "训练动作", "完成标准", "复测结果"],
};

function filesUnder(path) {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((item) => {
    const child = join(path, item.name);
    return item.isDirectory() ? filesUnder(child) : item.name.endsWith(".md") ? [child] : [];
  });
}

function parseDocument(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("缺少合法 Frontmatter");
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const field = line.match(/^([a-z]+):\s*(.*)$/);
    if (!field) throw new Error(`无法解析 Frontmatter 行：${line}`);
    fields[field[1]] = field[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  return { fields, body: match[2] };
}

function list(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function section(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.match(new RegExp(`^## ${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1]?.trim() ?? "";
}

function validateFile(path) {
  const errors = [];
  const name = basename(path);
  if (!/^\d{8}-[a-z0-9-]+-[a-z0-9-]+\.md$/.test(name)) errors.push("文件名必须符合 YYYYMMDD-author-short-title.md");

  let document;
  try {
    document = parseDocument(readFileSync(path, "utf8"));
  } catch (error) {
    return [error.message];
  }
  const { fields, body } = document;

  for (const key of Object.keys(fields)) if (!allowedFields.has(key)) errors.push(`未知字段：${key}`);
  for (const key of requiredFields) if (!fields[key]) errors.push(`缺少字段：${key}`);
  for (const [key, values] of Object.entries(enums)) {
    if (fields[key] && !values.includes(fields[key])) errors.push(`${key} 不在允许枚举中：${fields[key]}`);
  }

  if (fields.updated && !/^\d{4}-\d{2}-\d{2}$/.test(fields.updated)) errors.push("updated 必须为 YYYY-MM-DD");
  if (!list(fields.topics ?? "").length) errors.push("topics 至少包含一项");

  const authors = new Set(list(fields.authors ?? ""));
  const reviewers = list(fields.reviewers ?? "");
  if ([...authors, ...reviewers].some((user) => !/^@[A-Za-z0-9-]+$/.test(user))) errors.push("authors 和 reviewers 必须使用 GitHub @用户名");
  if (!reviewers.some((reviewer) => !authors.has(reviewer))) errors.push("reviewers 至少包含一位非作者 reviewer");

  for (const id of list(fields.related ?? "")) {
    if (!/^\d{8}-[a-z0-9-]+-[a-z0-9-]+$/.test(id)) errors.push(`related 条目 ID 非法：${id}`);
  }

  const headings = [...commonHeadings, ...(typeHeadings[fields.kind] ?? [])];
  for (const heading of headings) if (!section(body, heading)) errors.push(`缺少内容：## ${heading}`);
  if (/http:\/\//i.test(section(body, "来源"))) errors.push("外部来源必须使用 HTTPS");

  return errors;
}

let failures = 0;
for (const path of filesUnder(knowledgeRoot)) {
  for (const error of validateFile(path)) {
    failures += 1;
    console.error(`${path}: ${error}`);
  }
}

if (failures) process.exitCode = 1;
else console.log(`Validated ${filesUnder(knowledgeRoot).length} knowledge entries.`);
