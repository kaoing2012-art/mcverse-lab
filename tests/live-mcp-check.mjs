/** 真实 MCP 调用验证脚本（输出不含 Token） */
import { McpClient, loadToken } from '../src/mcp-client.js';
import { normalizeMcpItems, matchMeals } from '../src/matching.js';

const client = new McpClient({ token: loadToken() });

// 1. initialize + tools/list
const tools = await client.listTools();
console.log('✓ 工具发现成功，共', tools.length, '个工具');
const readTools = ['now-time-info', 'list-nutrition-foods', 'query-nearby-stores', 'query-meals', 'query-meal-detail'];
for (const t of readTools) {
  console.log('  -', t, tools.some((x) => x.name === t) ? '✓ 存在' : '✗ 缺失');
}

// 2. list-nutrition-foods 真实调用
const raw = await client.callTool('list-nutrition-foods', {});
const { items, warning } = normalizeMcpItems(raw);
console.log('✓ list-nutrition-foods 返回，解析出', items.length, '个餐品', warning ? `(warning: ${warning})` : '');
console.log('  示例:', items.slice(0, 6).map((i) => i.name).join(' / '));

// 3. 六人格真实匹配
for (const pid of ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']) {
  const m = matchMeals(pid, items, 1);
  console.log(`  ${pid} 匹配:`, m.length ? m[0].item.name + `（${m[0].score}分）` : '（无命中，需检查关键词）');
}
console.log('✓ 真实数据链路验证完成');
