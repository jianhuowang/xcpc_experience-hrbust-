import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, join, relative, resolve, isAbsolute, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { parseDocument } from '../scripts/knowledge.mjs';
import { validateLibrary } from '../scripts/validate-library.mjs';

const KNOWLEDGE = '.agents/skills/xcpc-experience-coach/references/knowledge';
const modes = new Set(['H1', 'H2', 'H3', 'reference']);
const scopes = new Set(['all', 'association', 'external']);
const units = new Set(['page', 'slide', 'paragraph', 'table', 'line']);
const directRoles = new Set(['statement', 'solution', 'code']);
const allowedKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).every((key) => keys.includes(key));
const fail = (code, detail = '') => { throw new Error(`${code}${detail ? `: ${detail}` : ''}`); };
const encode = (part) => encodeURIComponent(part).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

function git(root, args, trim = true) {
  const output = execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true });
  return trim ? output.trim() : output;
}

function safeRead(base, path, expectedHash) {
  const target = realpathSync(resolve(base, path));
  const location = relative(realpathSync(base), target);
  if (isAbsolute(location) || location === '..' || location.startsWith(`..${sep}`)) fail('unsafe_path');
  const bytes = readFileSync(target);
  if (expectedHash && createHash('sha256').update(bytes).digest('hex') !== expectedHash) fail('source_changed');
  return bytes.toString('utf8');
}

function metadataResult(item) {
  return {
    id: item.id, title: item.title, url: item.url, layer: item.layer, status: item.status,
    role: item.role, format: item.format, units: item.units, warnings: item.warnings ?? []
  };
}

function queryTerms(query) {
  const normalized = query.toLowerCase().replace(/[^\p{L}\p{N}_]+/gu, ' ').trim();
  if (!/[\p{L}\p{N}]/u.test(normalized)) fail('invalid_argument', 'query requires letters or numbers');
  const additions = [];
  if (/搜索|search|剪枝/.test(normalized)) additions.push('search', '搜索', '剪枝');
  if (/动态规划|\bdp\b|dynamic programming/.test(normalized)) additions.push('dynamic-programming', 'dynamic programming', '动态规划', 'dp');
  return [...new Set([normalized, ...additions])];
}

function transcriptUnits(content, unit) {
  if (unit === 'line') {
    const lines = content.split(/\r?\n/), heading = lines.findIndex((line) => /^## 原始行 \d+[–-]\d+$/.test(line));
    const open = lines.findIndex((line, index) => index > heading && /^`{3,}\w*$/.test(line));
    if (heading < 0 || open < 0) return [];
    const fence = lines[open].match(/^`{3,}/)[0];
    const close = lines.findIndex((line, index) => index > open && line === fence);
    return lines.slice(open + 1, close < 0 ? undefined : close);
  }
  const labels = { page: '物理页', slide: '幻灯片', paragraph: '段落', table: '表格' };
  const heading = new RegExp(`^#{2,3} ${labels[unit]} (\\d+)$`);
  const found = new Map();
  let current = null, fence = null;
  for (const line of content.split(/\r?\n/)) {
    const ticks = line.match(/^(`{3,})/);
    if (ticks && !fence) fence = ticks[1]; else if (fence && line === fence) fence = null;
    const anyUnit = !fence && line.match(/^#{2,3} (?:物理页|幻灯片|段落|表格) \d+$/);
    if (anyUnit) current = null;
    const match = !fence && line.match(heading);
    if (match) { current = Number(match[1]); found.set(current, []); continue; }
    if (current !== null) found.get(current).push(line);
  }
  return found;
}

function cleanUnit(lines) {
  while (lines[0] === '') lines.shift();
  while (lines.at(-1) === '') lines.pop();
  if (/^```/.test(lines[0] ?? '')) lines.shift();
  if (/^`{3,}$/.test(lines.at(-1) ?? '')) lines.pop();
  return lines.join('\n');
}

function externalText(root, item, unit, start, requestedCount, defaultCount) {
  const content = safeRead(join(root, 'sources/wzj52501'), item.text_path, item.text_sha256);
  if (unit === 'line') {
    const lines = transcriptUnits(content, unit), available = Math.max(0, lines.length - start + 1);
    if (!available || (requestedCount !== undefined && requestedCount > available)) fail('invalid_argument', 'range exceeds available units');
    const count = requestedCount ?? Math.min(defaultCount, available);
    const text = lines.slice(start - 1, start - 1 + count).join('\n');
    return { text, count, empty: !text.trim() };
  }
  const found = transcriptUnits(content, unit);
  let available = 0;
  while (found.has(start + available)) available++;
  if (!available || (requestedCount !== undefined && requestedCount > available)) fail('invalid_argument', 'range exceeds available units');
  const count = requestedCount ?? Math.min(defaultCount, available);
  const parts = [];
  for (let number = start; number < start + count; number++) {
    if (!found.has(number)) fail('invalid_argument', 'start exceeds available units');
    parts.push(`${labelsFor(unit)} ${number}\n${cleanUnit([...found.get(number)])}`);
  }
  return { text: parts.join('\n\n'), count, empty: parts.every((part) => !part.slice(part.indexOf('\n') + 1).trim()) };
}

function labelsFor(unit) { return { page: '物理页', slide: '幻灯片', paragraph: '段落', table: '表格' }[unit]; }

export function loadCatalog(root) {
  root = realpathSync(root);
  if (git(root, ['status', '--porcelain', '--', KNOWLEDGE])) fail('knowledge_snapshot_dirty');
  const revision = git(root, ['rev-parse', 'HEAD']);
  const remote = 'https://github.com/jianhuowang/xcpc_experience-hrbust-';
  const catalog = new Map();

  const committedPaths = git(root, ['ls-tree', '-r', '-z', '--name-only', revision, '--', KNOWLEDGE], false).split('\0').filter((path) => path.endsWith('.md'));
  for (const gitPath of committedPaths) {
    const raw = git(root, ['show', `${revision}:${gitPath}`], false);
    const { fields } = parseDocument(raw);
    if (fields.status !== 'active') continue;
    const lines = raw.split(/\r?\n/);
    const titleIndex = lines.findIndex((line) => /^# /.test(line));
    const id = basename(gitPath, '.md');
    if (catalog.has(id)) fail('duplicate_id');
    const encodedPath = gitPath.split('/').map(encode).join('/');
    catalog.set(id, { id, title: lines[titleIndex].slice(2), url: `${remote}/blob/${revision}/${encodedPath}#L${titleIndex + 1}`,
      layer: 'association', status: fields.status, role: fields.kind, format: 'md', units: lines.length,
      warnings: [], topics: fields.topics ?? '', gitPath });
  }

  const libraryRoot = join(root, 'sources/wzj52501');
  const externalAvailable = existsSync(libraryRoot);
  if (externalAvailable) {
    validateLibrary(libraryRoot);
    const manifest = JSON.parse(readFileSync(join(libraryRoot, 'manifest.json'), 'utf8'));
    for (const entry of manifest.entries) {
      if (catalog.has(entry.id)) fail('duplicate_id');
      catalog.set(entry.id, { ...entry, title: entry.path, url: entry.source_url, layer: 'external', topics: `${entry.path} ${entry.group}` });
    }
  }

  function search(args) {
    if (!allowedKeys(args, ['query', 'mode', 'scope', 'limit', 'offset'])) fail('invalid_argument');
    const { query, mode = 'H1', scope = 'all', limit = 10, offset = 0 } = args;
    if (typeof query !== 'string' || query.trim().length < 1 || query.length > 200 || !modes.has(mode)
      || !scopes.has(scope) || !Number.isSafeInteger(limit) || limit < 1 || limit > 20
      || !Number.isSafeInteger(offset) || offset < 0) fail('invalid_argument');
    const terms = queryTerms(query);
    const matches = [...catalog.values()].filter((item) => (scope === 'all' || item.layer === scope)
      && terms.some((term) => {
        const haystack = `${item.id} ${item.title} ${item.topics}`.toLowerCase().replace(/[^\p{L}\p{N}_]+/gu, ' ');
        return term.split(/\s+/).every((word) => haystack.includes(word));
      }));
    return { results: matches.slice(offset, offset + limit).map(metadataResult), total: matches.length, offset,
      external_available: externalAvailable, knowledge_revision: revision,
      note: externalAvailable ? '仅检索目录元数据；外部资料未经协会技术审核。' : '外部资料库未接入；仅检索协会目录元数据。' };
  }

  function fetch(args) {
    if (!allowedKeys(args, ['id', 'mode', 'unit', 'start', 'count'])) fail('invalid_argument');
    const { id, mode = 'H1', start = 1 } = args;
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id) || !modes.has(mode)
      || !Number.isSafeInteger(start) || start < 1) fail('invalid_argument');
    const item = catalog.get(id);
    if (!item) {
      const access = !externalAvailable && id.startsWith('wzj52501-') ? 'external_unavailable' : 'not_found';
      return { id, title: '', url: '', text: '', metadata: { layer: id.startsWith('wzj52501-') ? 'external' : 'unknown', status: access, role: 'metadata', format: '', units: 0, warnings: [], location: '不适用（仅元数据）', access, truncated: false, knowledge_revision: revision, direct_solution: false } };
    }
    const expected = item.layer === 'association' || ['md', 'cpp', 'text'].includes(item.format) ? 'line'
      : item.format === 'pdf' ? 'page' : item.format === 'pptx' ? 'slide' : 'paragraph';
    const unit = args.unit ?? expected;
    const maxima = { page: 5, slide: 5, paragraph: 10, table: 10, line: 100 };
    const defaults = { page: 1, slide: 1, paragraph: 10, table: 10, line: 80 };
    let count = args.count ?? Math.min(defaults[unit], Math.max(1, item.units - start + 1));
    const compatible = item.format === 'docx' ? ['paragraph', 'table'].includes(unit) : unit === expected;
    if (!units.has(unit) || !compatible || !Number.isSafeInteger(count) || count < 1 || count > maxima[unit]) fail('invalid_argument');
    if (item.layer === 'association' && item.units > 0 && (start > item.units || (args.count !== undefined && start + count - 1 > item.units))) fail('invalid_argument', 'range exceeds available units');
    const metadata = { ...metadataResult(item), license: item.license, attribution: item.attribution,
      location: '不适用（仅元数据）', access: ['withheld', 'failed'].includes(item.status) ? item.status : `${mode}-metadata`, truncated: false, knowledge_revision: revision,
      direct_solution: directRoles.has(item.role) };
    if (['H1', 'H2'].includes(mode) || ['withheld', 'failed'].includes(item.status)
      || (mode === 'reference' && item.layer === 'external' && directRoles.has(item.role))) {
      if (mode === 'reference' && item.layer === 'external' && directRoles.has(item.role) && !['withheld', 'failed'].includes(item.status)) metadata.access = 'requires_H3';
      return { id, title: item.title, url: item.url, text: '', metadata };
    }
    let text;
    if (item.layer === 'association') text = git(root, ['show', `${revision}:${item.gitPath}`], false).split(/\r?\n/).slice(start - 1, start - 1 + count).join('\n');
    else if (!item.text_path) return { id, title: item.title, url: item.url, text: '', metadata };
    else {
      const slice = externalText(root, item, unit, start, args.count, defaults[unit]);
      text = slice.text; count = slice.count; metadata.empty = slice.empty;
    }
    metadata.access = mode;
    metadata.location = unit === 'line' ? `原始行 ${start}–${start + count - 1}`
      : `${{ page: '物理页', slide: '幻灯片', paragraph: '段落', table: '表格' }[unit]} ${start}${count > 1 ? `–${start + count - 1}` : ''}`;
    if (text.length > 16000) { text = text.slice(0, 16000); metadata.truncated = true; }
    if (item.layer === 'association' && !text.trim()) metadata.empty = true;
    return { id, title: item.title, url: item.url, text, metadata };
  }

  return { search, fetch, externalAvailable, revision };
}
