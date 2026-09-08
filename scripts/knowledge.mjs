import { readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";

function filesUnder(path) {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((item) => {
    const child = join(path, item.name);
    return item.isDirectory() ? filesUnder(child) : item.name.endsWith(".md") ? [child] : [];
  });
}

export function knowledgeFiles(root) {
  const files = filesUnder(root).sort();
  const ids = new Set();
  for (const path of files) {
    const id = basename(path, ".md");
    if (ids.has(id)) throw new Error(`重复条目 ID：${id}（${path}）`);
    ids.add(id);
  }
  return files;
}

// ponytail: 仅解析单行 Frontmatter；需要多行或嵌套 YAML 时再使用解析库。
export function parseDocument(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("缺少合法 Frontmatter");
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const field = line.match(/^([a-z]+):\s*(.*)$/);
    if (!field) throw new Error(`无法解析 Frontmatter 行：${line}`);
    if (Object.hasOwn(fields, field[1])) throw new Error(`重复 Frontmatter 字段：${field[1]}`);
    fields[field[1]] = field[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  return { fields, body: match[2] };
}
