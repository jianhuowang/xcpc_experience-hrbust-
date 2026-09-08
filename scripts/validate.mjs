import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { knowledgeFiles, parseDocument } from "./knowledge.mjs";

const knowledgeRoot = resolve(process.argv[2] ?? ".agents/skills/xcpc-experience-coach/references/knowledge");
const allowedFields = new Set(["kind", "topics", "evidence", "authors", "status", "updated", "related"]);
const requiredFields = ["kind", "topics", "evidence", "authors", "status", "updated"];
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

function list(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function section(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.match(new RegExp(`^## ${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1]?.trim() ?? "";
}

function validateFile(path, knownIds, activeBodies) {
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

  if (fields.status === "active") {
    // ponytail: 只拦截确定的正文复制；改写后的语义重复交给投稿 Skill 对比。
    const normalized = body.replace(/\r\n/g, "\n")
      .replace(/^(?:[ \t]*\n)*#[ \t]+[^\n]*(?:\n|$)/, "")
      .replace(/^(?:[ \t]*\n)+|(?:\n[ \t]*)+$/g, "");
    const existing = activeBodies.get(normalized);
    if (existing) errors.push(`active 正文重复：${basename(path, ".md")} 与 ${existing}；请引用或补充已有条目`);
    else activeBodies.set(normalized, basename(path, ".md"));
  }

  for (const key of Object.keys(fields)) if (!allowedFields.has(key)) errors.push(`未知字段：${key}`);
  for (const key of requiredFields) if (!fields[key]) errors.push(`缺少字段：${key}`);
  for (const [key, values] of Object.entries(enums)) {
    if (fields[key] && !values.includes(fields[key])) errors.push(`${key} 不在允许枚举中：${fields[key]}`);
  }

  if (fields.updated && !/^\d{4}-\d{2}-\d{2}$/.test(fields.updated)) errors.push("updated 必须为 YYYY-MM-DD");
  if (!list(fields.topics ?? "").length) errors.push("topics 至少包含一项");
  const topics = (fields.topics ?? "").split(",").map((topic) => topic.trim());
  if (topics.some((topic) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic))) errors.push("topics 每项必须使用小写 kebab-case，且不能有空项");
  if (new Set(topics).size !== topics.length) errors.push("topics 不得重复");

  const authors = list(fields.authors ?? "");
  if (!authors.length || authors.some((user) => !/^@[A-Za-z0-9-]+$/.test(user))) errors.push("authors 必须使用 GitHub @用户名");

  for (const id of list(fields.related ?? "")) {
    if (!/^\d{8}-[a-z0-9-]+-[a-z0-9-]+$/.test(id)) errors.push(`related 条目 ID 非法：${id}`);
    else if (id === basename(path, ".md")) errors.push(`related 不能指向自身：${id}`);
    else if (!knownIds.has(id)) errors.push(`related 条目不存在：${id}`);
  }

  const headings = [...commonHeadings, ...(typeHeadings[fields.kind] ?? [])];
  for (const heading of headings) {
    const content = section(body, heading);
    if (!content) errors.push(`缺少内容：## ${heading}`);
    else if (fields.status === "active" && /^(?:TODO\b|TBD\b|待补充|替换为)/i.test(content)) {
      errors.push(`active 条目不能保留占位内容：## ${heading}`);
    }
  }
  if (/http:\/\//i.test(section(body, "来源"))) errors.push("外部来源必须使用 HTTPS");

  return errors;
}

let failures = 0;
const files = knowledgeFiles(knowledgeRoot);
const knownIds = new Set(files.map((path) => basename(path, ".md")));
const activeBodies = new Map();
for (const path of files) {
  for (const error of validateFile(path, knownIds, activeBodies)) {
    failures += 1;
    console.error(`${path}: ${error}`);
  }
}

if (failures) process.exitCode = 1;
else console.log(`Validated ${files.length} knowledge entries.`);
