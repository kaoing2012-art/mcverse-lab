/**
 * McVerse Lab —— 主流水线
 * 人格评分 → MCP 真实餐品查询（失败自动降级 Demo）→ 匹配 → 电影内容生成
 *
 * source 字段取值：
 * - 'live'：全部餐品来自麦当劳 MCP 实时查询
 * - 'demo'：MCP 不可用，使用本地 Demo 数据（结果中会明确标注）
 */

import { scoreQuiz } from './persona.js';
import { McpClient, loadToken, McpError } from './mcp-client.js';
import { normalizeMcpItems, matchMeals, loadDemoMenu } from './matching.js';
import {
  generateCharacter, generatePosterPrompts, generateStoryboard, exportResultText,
} from './generator.js';

/**
 * @param {number[]} answers - 4 道题的选项索引
 * @param {object} opts
 * @param {string}  [opts.token]        显式 MCP Token
 * @param {object}  [opts.mcpClient]    注入的客户端（测试用）
 * @param {string}  [opts.location]     可选定位描述，如「上海市黄浦区」，用于门店菜单查询
 * @param {boolean} [opts.allowDemo=true] MCP 失败时是否允许 Demo 模式
 */
export async function runPipeline(answers, opts = {}) {
  const allowDemo = opts.allowDemo !== false;
  const scored = scoreQuiz(answers);
  const debug = { toolsCalled: [], startedAt: new Date().toISOString(), mcpError: null };

  let menu = null;
  let source = 'live';

  // ---- MCP 真实查询（工具发现 → 只读查询）----
  try {
    const client = opts.mcpClient || new McpClient({ token: loadToken(opts.token) });
    const tools = await client.listTools();
    debug.toolsCalled.push('tools/list');
    const toolNames = new Set(tools.map((t) => t.name));

    let rawItems = null;

    // 路径 A：有定位 → 门店菜单（更真实）；路径 B：营养餐品表（无需定位）
    if (opts.location && toolNames.has('query-nearby-stores') && toolNames.has('query-meals')) {
      const stores = await client.callTool('query-nearby-stores', { address: opts.location });
      debug.toolsCalled.push('query-nearby-stores');
      const storeId = extractStoreId(stores);
      if (storeId && toolNames.has('query-meals')) {
        rawItems = await client.callTool('query-meals', { storeId });
        debug.toolsCalled.push('query-meals');
      }
    }
    if (!rawItems && toolNames.has('list-nutrition-foods')) {
      rawItems = await client.callTool('list-nutrition-foods', {});
      debug.toolsCalled.push('list-nutrition-foods');
    }
    if (!rawItems) {
      throw new McpError('MCP 上没有可用的只读餐品查询工具');
    }

    const norm = normalizeMcpItems(rawItems);
    if (norm.warning) debug.normalizeWarning = norm.warning;
    if (!norm.items.length) throw new McpError(norm.warning || 'MCP 餐品解析为空');
    menu = norm.items;
  } catch (err) {
    debug.mcpError = `${err.name}: ${err.message}`;
    if (!allowDemo) throw err;
    source = 'demo';
    menu = loadDemoMenu().items;
  }

  // ---- 匹配 + 生成 ----
  const matched = matchMeals(scored.personaId, menu, 3);
  const meal = matched[0] || { item: menu[0] || { name: '招牌套餐', category: '', tags: [] }, score: 0 };
  const character = generateCharacter(scored.personaId, meal.item.name);
  const poster = generatePosterPrompts(scored.personaId, meal.item.name);
  const storyboard = generateStoryboard(scored.personaId, meal.item.name, character.movieTitle);

  return {
    source,
    sourceLabel: source === 'live'
      ? '餐品数据：麦当劳 MCP 实时查询'
      : '【DEMO 模式：MCP 不可用，本结果使用本地演示数据，非实时】',
    persona: scored.persona,
    scores: scored.scores,
    isTie: scored.isTie,
    meal,
    alternativeMeals: matched.slice(1).map((m) => m.item.name),
    character,
    poster,
    storyboard,
    debug,
    exportedText: null, // 由调用方按需填充 exportResultText
  };
}

/** 从门店查询结果中防御式提取第一个门店 ID */
function extractStoreId(raw) {
  const payload = raw?.__json ?? raw?.__structured ?? raw;
  const candidates = [payload, payload?.data, payload?.data?.list, payload?.result, payload?.stores];
  const arr = candidates.find((c) => Array.isArray(c)) || [];
  for (const s of arr) {
    if (!s || typeof s !== 'object') continue;
    const id = s.storeId || s.store_id || s.id || s.storeCode;
    if (id) return String(id);
  }
  return null;
}

export { exportResultText };
