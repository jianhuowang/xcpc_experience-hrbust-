import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Run against your own deployed endpoint; this sends only public test queries.
export async function checkMcp(url) {
  const client = new Client({ name: 'xcpc-acceptance', version: '1.0.0' });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(url)));
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name).sort(), ['fetch', 'search']);
    assert.ok(tools.every(tool => tool.annotations?.readOnlyHint));
    const call = async (name, args) => {
      const result = await client.callTool({ name, arguments: args });
      assert.ok(!result.isError, JSON.stringify(result.content));
      assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
      return result.structuredContent;
    };
    const association = await call('search', { query: '__int128', scope: 'association', mode: 'reference' });
    assert.equal(association.results[0].id, '20260902-jianhuowang-int128-requires-64bit');
    const knowledge = await call('fetch', { id: association.results[0].id, mode: 'reference', start: 1, count: 30 });
    assert.match(knowledge.text, /64 位/);
    assert.equal((await call('search', { query: '最小费用最大流', scope: 'association', mode: 'reference' })).total, 0);
    const id = 'wzj52501-0f0daa9b82cfef46';
    assert.equal((await call('fetch', { id, mode: 'H1' })).text, '');
    const lecture = await call('fetch', { id, mode: 'reference', unit: 'page', start: 41, count: 1 });
    assert.match(lecture.text, /f\(x\) \+ g\(x\) ≤ cans/);
    assert.doesNotMatch(lecture.text, /h\(x\)|U\+001[45]/);
    assert.equal(lecture.metadata.status, 'needs-review');
    assert.match(lecture.metadata.location, /物理页 41/);
    assert.match((await call('fetch', { id, mode: 'reference', start: 42 })).text, /h\(x\) ≥ g\(x\)/);
    assert.match((await call('fetch', { id, mode: 'reference', start: 43 })).text, /U\+0014/);
    const sources = [];
    for (const args of [
      { id: 'wzj52501-e2940294a8c44755', unit: 'paragraph', start: 1, count: 4 },
      { id: 'wzj52501-1722249f1bebd56c', unit: 'page', start: 2, count: 2 },
    ]) {
      const result = await call('fetch', { ...args, mode: 'H3' });
      assert.ok(result.text.length > 0);
      assert.match(result.url, /\/blob\/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e\//);
      sources.push({ id: result.id, url: result.url, location: result.metadata.location });
    }
    return { ok: true, knowledge_revision: association.knowledge_revision, sources };
  } finally { await client.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error('请提供实际 MCP URL：node scripts/check-mcp.mjs <URL>');
    console.log(JSON.stringify(await checkMcp(process.argv[2]), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
