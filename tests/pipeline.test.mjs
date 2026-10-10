import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runPipeline } from '../src/pipeline.js';
import { McpClient, McpError, redact, WRITE_TOOLS } from '../src/mcp-client.js';

/** 构造一个 mock MCP 客户端：模拟真实工具发现与调用 */
function mockClient({ fail = false } = {}) {
  return {
    async listTools() {
      if (fail) throw new Error('MCP HTTP 401: token invalid');
      return [
        { name: 'list-nutrition-foods', description: 'mock' },
        { name: 'query-meals', description: 'mock' },
        { name: 'create-order', description: 'mock' },
      ];
    },
    async callTool(name) {
      return {
        __json: {
          data: {
            list: [
              { foodName: '巨无霸', categoryName: '汉堡' },
              { foodName: '麦辣鸡腿堡', categoryName: '汉堡', tags: ['辣'] },
              { foodName: '麦旋风', categoryName: '甜品', tags: ['甜'] },
            ],
          },
        },
      };
    },
  };
}

test('MCP 成功路径：source=live，使用真实（mock）返回的餐品名', async () => {
  const result = await runPipeline([0, 0, 2, 0], { mcpClient: mockClient(), allowDemo: false });
  assert.equal(result.source, 'live');
  assert.ok(['巨无霸', '麦辣鸡腿堡'].includes(result.meal.item.name));
  assert.ok(result.debug.toolsCalled.includes('list-nutrition-foods'));
});

test('MCP 失败路径：自动降级 demo，且结果明确标注', async () => {
  const result = await runPipeline([0, 1, 2, 3], { mcpClient: mockClient({ fail: true }) });
  assert.equal(result.source, 'demo');
  assert.ok(result.sourceLabel.includes('DEMO 模式'));
  assert.ok(result.debug.mcpError);
  assert.ok(result.meal.item.name, 'demo 模式也必须有餐品');
});

test('写操作黑名单包含全部资金/权益类工具', () => {
  for (const t of ['create-order', 'auto-bind-coupons', 'draw-lottery', 'mall-create-order', 'party-order-create']) {
    assert.ok(WRITE_TOOLS.has(t), `${t} 必须在写操作黑名单里`);
  }
});

test('写操作拦截：callTool 拒绝 create-order（不发起任何网络请求）', async () => {
  const client = new McpClient({
    token: 'dummy-token-for-intercept-test',
    fetchImpl: async () => { throw new Error('不应发起网络请求'); },
  });
  await assert.rejects(
    () => client.callTool('create-order', {}),
    (err) => err instanceof McpError && err.message.includes('写操作')
  );
});

test('Token 脱敏：redact 把 Bearer 后的内容遮蔽为 ***', () => {
  const input = '请求失败: Authorization: Bearer super-secret-token-123';
  const out = redact(input);
  assert.ok(!out.includes('super-secret-token-123'), '脱敏后不能包含原始 token');
  assert.ok(out.includes('Bearer ***'));
});
