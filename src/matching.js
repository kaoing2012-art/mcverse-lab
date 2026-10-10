/**
 * McVerse Lab —— 人格 × 餐品匹配模块
 *
 * 数据来源优先级：
 * 1. live：麦当劳 MCP 真实查询结果（list-nutrition-foods / query-meals）
 * 2. demo：本地 demo-menu.json，且调用方必须把结果标注为【DEMO 模式】
 *
 * 匹配规则（确定性）：
 * - 每个人格有一组关键词，命中餐品名 +2、命中标签 +1；
 * - 得分相同时保持菜单原始顺序（先出现者优先），不做任何随机。
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const PERSONA_MEAL_KEYWORDS = {
  // 天生主角型：经典中的经典，气场要足
  P1: ['巨无霸', '安格斯', '双层', '经典', '牛'],
  // 热血冒险型：辣就是燃料
  P2: ['辣', '板烧', '烤翅', '鸡翅', '鸡'],
  // 温柔治愈型：甜的软的，入口即安
  P3: ['甜筒', '圆筒', '冰淇淋', '旋风', '派', '奶'],
  // 冷静智谋型：清醒的脑子才配做决策
  P4: ['美式', '咖啡', '浓', '拿铁'],
  // 快乐社交型：一桌人分着吃才叫快乐
  P5: ['分享', '桶', '麦乐鸡', '可乐', '全家'],
  // 自由浪漫型：一点果味，一点阳光，一点不期而遇
  P6: ['青提', '桂花', '阳光', '果', '柠檬', '橙', '气泡'],
};

/**
 * 把 MCP 返回的各种可能结构归一化为 [{name, category, tags}]。
 * 官方工具响应字段可能随版本调整，这里做防御式字段探测。
 * 已实测支持的真实格式（2026-10-10，list-nutrition-foods）：
 *   content[0].text 为 markdown 包裹的 JSON，其 data 字段是表格字符串：
 *   "[160]{productName,nutritionDescription,energyKcal,...}:\n  猪柳麦满分,null,..."
 * @param {any} raw - McpClient.callTool 的返回值
 * @returns {{items: Array, warning: string|null}}
 */
export function normalizeMcpItems(raw) {
  if (!raw) return { items: [], warning: 'MCP 返回为空' };

  // callTool 已把 text 解析成 __json；解析失败时保留 __text
  let payload = raw.__json ?? raw.__structured ?? null;

  // 真实格式：__text 是 markdown 包裹的 JSON，从中提取
  if (!payload && typeof raw.__text === 'string') {
    payload = extractEmbeddedJson(raw.__text);
  }

  // data 为表格字符串（真实观测到的 list-nutrition-foods 格式）
  if (payload && typeof payload.data === 'string') {
    const items = parseTabularData(payload.data);
    if (items.length) return { items, warning: null };
  }

  // payload 可能是 {data: {...}} / {result: [...]} / 直接数组 等
  const candidates = [payload, payload?.data, payload?.data?.list, payload?.result,
    payload?.list, payload?.foods, payload?.items];
  const arr = candidates.find((c) => Array.isArray(c));
  if (!arr) return { items: [], warning: 'MCP 响应中未找到列表结构' };

  const NAME_KEYS = ['name', 'foodName', 'food_name', 'productName', 'product_name', 'title', 'foodNameCn'];
  const CAT_KEYS = ['category', 'categoryName', 'category_name', 'type', 'typeName'];
  const TAG_KEYS = ['tags', 'tagList', 'labels'];

  const items = [];
  for (const it of arr) {
    if (!it || typeof it !== 'object') continue;
    const name = NAME_KEYS.map((k) => it[k]).find((v) => typeof v === 'string' && v.trim());
    if (!name) continue;
    const category = CAT_KEYS.map((k) => it[k]).find((v) => typeof v === 'string') || '';
    let tags = TAG_KEYS.map((k) => it[k]).find((v) => Array.isArray(v)) || [];
    tags = tags.map((t) => (typeof t === 'string' ? t : t?.name || '')).filter(Boolean);
    items.push({ name: name.trim(), category, tags });
  }
  return { items, warning: items.length ? null : 'MCP 列表中未解析出餐品名' };
}

/** 从 markdown 文本中提取第一段完整 JSON 对象 */
function extractEmbeddedJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * 解析官方表格字符串格式：
 * "[N]{field1,field2,...}:\n  value1,value2,...\n  ..."
 */
export function parseTabularData(data) {
  if (typeof data !== 'string') return [];
  const m = data.match(/^\[(\d+)\]\{([^}]+)\}:\s*\n?/);
  if (!m) return [];
  const fields = m[2].split(',').map((s) => s.trim());
  const nameIdx = fields.findIndex((f) => /name/i.test(f) && !/description/i.test(f));
  if (nameIdx < 0) return [];
  const kcalIdx = fields.indexOf('energyKcal');

  const items = [];
  for (const row of data.slice(m[0].length).split('\n')) {
    const line = row.trim();
    if (!line) continue;
    const vals = line.split(',');
    const name = vals[nameIdx]?.trim();
    if (!name || name === 'null') continue;
    const item = { name, category: '', tags: [] };
    if (kcalIdx >= 0 && vals[kcalIdx] && vals[kcalIdx] !== 'null') item.energyKcal = vals[kcalIdx].trim();
    items.push(item);
  }
  return items;
}

function scoreItem(item, keywords) {
  let s = 0;
  const name = item.name || '';
  const tags = Array.isArray(item.tags) ? item.tags.join(' ') : String(item.tags || '');
  for (const kw of keywords) {
    if (name.includes(kw)) s += 2;
    else if (tags.includes(kw) || (item.category || '').includes(kw)) s += 1;
  }
  return s;
}

/**
 * 按人格匹配餐品。
 * @param {string} personaId P1~P6
 * @param {Array<{name,category?,tags?}>} menu 归一化菜单
 * @param {number} topN 返回前 N 个
 * @returns {Array<{item, score}>} 稳定排序结果
 */
export function matchMeals(personaId, menu, topN = 3) {
  const keywords = PERSONA_MEAL_KEYWORDS[personaId] || [];
  if (!menu?.length) return [];

  return menu
    .map((item, index) => ({ item, index, score: scoreItem(item, keywords) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => (b.score - a.score) || (a.index - b.index)) // 分数降序 → 原始顺序（平分必确定性）
    .slice(0, topN)
    .map(({ item, score }) => ({ item, score }));
}

/** 加载 Demo 菜单（明确标注 demo 模式） */
export function loadDemoMenu() {
  const raw = JSON.parse(readFileSync(join(__dirname, 'data', 'demo-menu.json'), 'utf8'));
  return { mode: 'demo', items: raw.items };
}
