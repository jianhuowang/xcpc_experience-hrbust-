import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createHttpServer } from '../mcp/server.mjs';
import { loadInstructions } from '../mcp/server.mjs';
import { loadCatalog } from '../mcp/catalog.mjs';
import { checkMcp } from '../scripts/check-mcp.mjs';
import { resolve } from 'node:path';

const item = { id: 'test-id', title: '测试条目', url: 'https://example.org/source', layer: 'association', status: 'active', role: 'knowledge', format: 'md', units: 1, warnings: [] };
const catalog = {
  revision: 'a'.repeat(40), externalAvailable: false,
  search: () => ({ results: [item], total: 1, offset: 0, external_available: false, knowledge_revision: 'a'.repeat(40), note: '仅目录' }),
  fetch: () => ({ id: item.id, title: item.title, url: item.url, text: '', metadata: { access: 'metadata-only' } }),
};

async function fixture(t, options = {}) {
  const server = createHttpServer({ catalog, instructions: '测试规则：H1 不读取正文。', ...options });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    const closed = once(server, 'close');
    server.close(); server.closeAllConnections(); await closed;
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test('official SDK initializes, lists only read-only search/fetch and calls structured tools over HTTP', async (t) => {
  const base = await fixture(t);
  const client = new Client({ name: 'exp-test', version: '1.0' });
  t.after(() => client.close());
  await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)));
  assert.match(client.getInstructions(), /H1/);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map(x => x.name).sort(), ['fetch', 'search']);
  for (const tool of tools) {
    assert.equal(tool.annotations.readOnlyHint, true);
    assert.equal(tool.annotations.destructiveHint, false);
    assert.ok(tool.outputSchema);
  }
  const result = await client.callTool({ name: 'search', arguments: { query: '整数' } });
  assert.equal(result.isError, undefined);
  assert.equal(result.structuredContent.results[0].id, 'test-id');
  assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
  const reading = await client.callTool({ name: 'fetch', arguments: { id: 'test-id' } });
  assert.equal(reading.structuredContent.text, '');
  const invalid = await client.callTool({ name: 'fetch', arguments: { id: 'test-id', start: -1 } });
  assert.equal(invalid.isError, true);
  const extra = await client.callTool({ name: 'fetch', arguments: { id: 'test-id', path: '../../AGENTS.md' } });
  assert.equal(extra.isError, true);
});

test('HTTP exposes no files and rejects untrusted Host/Origin, unsupported methods and oversized requests', async (t) => {
  const base = await fixture(t);
  assert.equal((await fetch(`${base}/health`)).status, 200);
  for (const path of ['/AGENTS.md', '/sources/wzj52501/manifest.json', '/.git/config']) {
    assert.equal((await fetch(`${base}${path}`)).status, 404);
  }
  assert.equal((await fetch(`${base}/mcp`)).status, 405);
  assert.equal((await fetch(`${base}/mcp`, { method: 'DELETE' })).status, 405);
  assert.equal((await fetch(`${base}/mcp`, { method: 'POST', headers: { Origin: 'https://untrusted.example' }, body: '{}' })).status, 403);
  // fetch normalizes Host; use a raw HTTP client to actually send the hostile header.
  const hostileHostStatus = await new Promise((accept, reject) => {
    const req = request(`${base}/health`, { headers: { Host: 'untrusted.example' } }, res => { res.resume(); accept(res.statusCode); });
    req.on('error', reject); req.end();
  });
  assert.equal(hostileHostStatus, 403);
  assert.equal((await fetch(`${base}/mcp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(65537) })).status, 413);
  assert.equal((await fetch(`${base}/mcp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
});

test('tool failures do not expose server paths or internal exception details', async (t) => {
  const base = await fixture(t, { catalog: { ...catalog, fetch() { throw new Error('SECRET C:/private/credentials'); } } });
  const client = new Client({ name: 'exp-test', version: '1.0' });
  t.after(() => client.close());
  await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)));
  const result = await client.callTool({ name: 'fetch', arguments: { id: 'test-id' } });
  assert.equal(result.isError, true);
  assert.doesNotMatch(JSON.stringify(result), /SECRET|private|credentials/);
});

test('Origin remains enforced after many headers, chunked bodies are bounded and MCP uses JSON responses', async (t) => {
  const base = await fixture(t);
  const headers = { Host: 'localhost' };
  for (let i = 0; i < 55; i++) headers[`X-Pad-${i}`] = 'x';
  headers.Origin = 'https://untrusted.example';
  const lateOriginStatus = await new Promise((accept, reject) => {
    const req = request(`${base}/health`, { headers }, res => { res.resume(); accept(res.statusCode); });
    req.on('error', reject); req.end();
  });
  assert.equal(lateOriginStatus, 403);
  const chunkedStatus = await new Promise((accept, reject) => {
    const req = request(`${base}/mcp`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' } }, res => { res.resume(); accept(res.statusCode); });
    req.on('error', reject); req.write('x'.repeat(40000)); req.end('x'.repeat(30000));
  });
  assert.equal(chunkedStatus, 413);
  const initialized = await fetch(`${base}/mcp`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'json-probe', version: '1' } } }),
  });
  assert.equal(initialized.status, 200);
  assert.match(initialized.headers.get('content-type'), /^application\/json/);
  assert.equal((await initialized.json()).result.serverInfo.name, 'xcpc-experience');
});

test('full fixed corpus works through the same SDK acceptance check used for a deployed URL', async (t) => {
  const root = resolve(import.meta.dirname, '..');
  const base = await fixture(t, { catalog: loadCatalog(root), instructions: loadInstructions(root) });
  const result = await checkMcp(`${base}/mcp`);
  assert.equal(result.ok, true);
  assert.equal(result.sources.length, 2);
});
