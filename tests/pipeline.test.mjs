import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runPipeline } from '../src/pipeline.js';
import { McpClient, McpError, redact, READ_ONLY_TOOLS } from '../src/mcp-client.js';

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

test('MCP 成功路径：source=live_catalog，使用真实（mock）返回的餐品名', async () => {
  const result = await runPipeline([0, 0, 2, 0], { mcpClient: mockClient(), allowDemo: false });
  assert.equal(result.source, 'live_catalog');
  assert.ok(result.sourceLabel.includes('餐品营养列表'), 'live_catalog 的文案必须限定为餐品营养列表');
  assert.ok(!/在售|可点|门店菜单/.test(result.sourceLabel), 'live_catalog 不得表述为在售/可点/门店菜单');
  assert.ok(['巨无霸', '麦辣鸡腿堡'].includes(result.meal.item.name));
  assert.ok(result.debug.toolsCalled.includes('list-nutrition-foods'));
});

test('MCP 失败路径：自动降级 demo，且结果明确标注', async () => {
  const result = await runPipeline([0, 1, 2, 3], { mcpClient: mockClient({ fail: true }) });
  assert.equal(result.source, 'demo');
  assert.ok(result.sourceLabel.includes('DEMO 模式'));
  assert.ok(!/在售|可点|门店菜单/.test(result.sourceLabel), 'demo 文案不得含在售类表述');
  assert.ok(result.debug.mcpError);
  assert.ok(result.meal.item.name, 'demo 模式也必须有餐品');
});

test('只读白名单：包含且仅包含 5 个查询类工具', () => {
  for (const t of ['now-time-info', 'list-nutrition-foods', 'query-nearby-stores', 'query-meals', 'query-meal-detail']) {
    assert.ok(READ_ONLY_TOOLS.has(t), `${t} 必须在只读白名单内`);
  }
  assert.equal(READ_ONLY_TOOLS.size, 5, '白名单不应被意外扩大');
});

test('只读白名单：所有写操作类工具均不在白名单内', () => {
  for (const t of ['create-order', 'cancel-order', 'auto-bind-coupons', 'draw-lottery',
    'mall-create-order', 'party-order-create', 'delivery-create-address', 'query-my-coupons']) {
    assert.ok(!READ_ONLY_TOOLS.has(t), `${t} 不应出现在只读白名单内`);
  }
});

test('安全拦截：写操作 create-order 被拒绝（且不发起网络请求）', async () => {
  const client = new McpClient({
    token: 'dummy-token-for-intercept-test',
    fetchImpl: async () => { throw new Error('不应发起网络请求'); },
  });
  await assert.rejects(
    () => client.callTool('create-order', {}),
    (err) => err instanceof McpError && err.message.includes('只读白名单')
  );
});

test('安全拦截：未知工具（未在白名单）默认拒绝', async () => {
  const client = new McpClient({
    token: 'dummy-token-for-intercept-test',
    fetchImpl: async () => { throw new Error('不应发起网络请求'); },
  });
  for (const unknown of ['some-brand-new-tool', 'mall-create-order', 'draw-lottery', 'query-order']) {
    await assert.rejects(
      () => client.callTool(unknown, {}),
      (err) => err instanceof McpError && err.message.includes('只读白名单'),
      `${unknown} 必须被安全拦截`
    );
  }
});

test('Token 脱敏：redact 把 Bearer 后的内容遮蔽为 ***', () => {
  const input = '请求失败: Authorization: Bearer super-secret-token-123';
  const out = redact(input);
  assert.ok(!out.includes('super-secret-token-123'), '脱敏后不能包含原始 token');
  assert.ok(out.includes('Bearer ***'));
});
