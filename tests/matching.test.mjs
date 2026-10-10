import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { matchMeals, normalizeMcpItems, loadDemoMenu, PERSONA_MEAL_KEYWORDS } from '../src/matching.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('Demo 菜单可加载且结构合法', () => {
  const { mode, items } = loadDemoMenu();
  assert.equal(mode, 'demo');
  assert.ok(items.length >= 10);
  for (const it of items) assert.ok(it.name, '餐品必须有名字');
});

test('关键词匹配：命中得分排序正确且稳定', () => {
  const { items } = loadDemoMenu();
  const result = matchMeals('P2', items, 3); // 热血冒险型 → 辣
  assert.ok(result.length > 0);
  // 分数降序
  for (let i = 1; i < result.length; i++) {
    assert.ok(result[i - 1].score >= result[i].score);
  }
  // 首位餐品名里应包含辣/鸡/板烧类关键词
  const first = result[0].item.name;
  assert.ok(
    PERSONA_MEAL_KEYWORDS.P2.some((kw) => first.includes(kw)),
    `首位 ${first} 应命中 P2 关键词`
  );
});

test('匹配确定性：同输入同输出（多次运行结果一致）', () => {
  const { items } = loadDemoMenu();
  const a = JSON.stringify(matchMeals('P1', items, 3));
  for (let i = 0; i < 10; i++) {
    assert.equal(JSON.stringify(matchMeals('P1', items, 3)), a);
  }
});

test('六种人格在 Demo 菜单上均有匹配结果', () => {
  const { items } = loadDemoMenu();
  for (const pid of Object.keys(PERSONA_MEAL_KEYWORDS)) {
    const r = matchMeals(pid, items, 3);
    assert.ok(r.length > 0, `${pid} 在 demo 菜单上应有命中`);
  }
});

test('normalizeMcpItems：防御式解析常见响应结构', () => {
  // 结构1：{data: {list: [...]}}
  const r1 = normalizeMcpItems({ __json: { data: { list: [{ foodName: '巨无霸', categoryName: '汉堡' }] } } });
  assert.equal(r1.items[0].name, '巨无霸');
  assert.equal(r1.items[0].category, '汉堡');

  // 结构2：直接数组 + tags
  const r2 = normalizeMcpItems({ __json: [{ name: '麦辣鸡腿堡', tags: ['辣', '鸡肉'] }] });
  assert.deepEqual(r2.items[0].tags, ['辣', '鸡肉']);

  // 结构3：空/异常结构 → warning 而非抛错
  const r3 = normalizeMcpItems({ __json: { foo: 1 } });
  assert.equal(r3.items.length, 0);
  assert.ok(r3.warning);
});

test('Demo 菜单不允许被标注为实时数据（结构自带 demo 标记）', () => {
  const raw = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'data', 'demo-menu.json'), 'utf8'));
  assert.equal(raw.mode, 'demo');
});
