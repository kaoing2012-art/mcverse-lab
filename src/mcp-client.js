/**
 * McVerse Lab —— 麦当劳 MCP 客户端（零依赖）
 *
 * 实现官方 Streamable HTTP 传输协议（JSON-RPC 2.0 over HTTP POST）：
 * 1. initialize        → 建立 session（捕获 mcp-session-id 响应头）
 * 2. notifications/initialized
 * 3. tools/list        → 工具发现（不假定任何工具名一定存在）
 * 4. tools/call        → 实际调用
 *
 * 安全约束：
 * - Token 只从 构造参数 / 环境变量 MCD_MCP_TOKEN / ~/.config/mcd/mcp_token 读取；
 * - 任何日志与错误信息中 Token 一律脱敏为 ***；
 * - 采用「只读白名单」：仅允许调用下列工具，其它任何 Tool（含未来的新增工具）
 *   一律默认拒绝，从根本上杜绝下单、领券、抽奖等写操作。
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const MCP_ENDPOINT = 'https://mcp.mcd.cn';

/**
 * 只读白名单（全部为查询类工具）：
 * - now-time-info         获取当前时间
 * - list-nutrition-foods  餐品营养列表（不代表门店在售状态）
 * - query-nearby-stores   查询附近门店
 * - query-meals           查询门店可售卖餐品（当前门店菜单）
 * - query-meal-detail     查询餐品详情
 * 不在名单内的一律拒绝。
 */
export const READ_ONLY_TOOLS = new Set([
  'now-time-info',
  'list-nutrition-foods',
  'query-nearby-stores',
  'query-meals',
  'query-meal-detail',
]);

export class McpError extends Error {
  constructor(message, { status = 0, code = null } = {}) {
    super(message);
    this.name = 'McpError';
    this.status = status;
    this.code = code;
  }
}

export function redact(text) {
  return String(text).replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer ***');
}

/** 按优先级加载 Token：显式参数 > 环境变量 > ~/.config/mcd/mcp_token 文件 */
export function loadToken(explicit = null) {
  if (explicit) return explicit;
  if (process.env.MCD_MCP_TOKEN && process.env.MCD_MCP_TOKEN !== 'YOUR_MCP_TOKEN') {
    return process.env.MCD_MCP_TOKEN.trim();
  }
  try {
    const p = join(homedir(), '.config', 'mcd', 'mcp_token');
    const t = readFileSync(p, 'utf8').trim();
    if (t) return t;
  } catch {
    /* 文件不存在，忽略 */
  }
  return null;
}

export class McpClient {
  /**
   * @param {object} opts
   * @param {string}  [opts.token]   MCP Token
   * @param {string}  [opts.url]     端点，默认官方地址
   * @param {Function}[opts.fetchImpl] 可注入的 fetch（测试用）
   */
  constructor({ token = null, url = MCP_ENDPOINT, fetchImpl = fetch } = {}) {
    this.url = url;
    this.token = token;
    this.fetchImpl = fetchImpl;
    this.sessionId = null;
    this.requestId = 0;
    this.initialized = false;
    this.toolsCache = null;
  }

  async #post(payload) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    if (this.sessionId) headers['mcp-session-id'] = this.sessionId;

    let res;
    try {
      res = await this.fetchImpl(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (err) {
      throw new McpError(`网络请求失败: ${redact(err.message)}`, { status: 0 });
    }

    const sid = res.headers.get('mcp-session-id');
    if (sid) this.sessionId = sid;

    const contentType = res.headers.get('content-type') || '';
    const raw = await res.text();

    if (!res.ok) {
      let msg = raw;
      try { msg = JSON.parse(raw).msg || raw; } catch { /* keep raw */ }
      throw new McpError(
        `MCP HTTP ${res.status}: ${redact(msg.slice(0, 200))}`,
        { status: res.status }
      );
    }

    // 响应可能是 application/json，也可能是 SSE（text/event-stream）
    if (contentType.includes('text/event-stream')) {
      return this.#parseSse(raw, payload.id);
    }
    try {
      return JSON.parse(raw);
    } catch {
      throw new McpError(`MCP 响应不是合法 JSON: ${redact(raw.slice(0, 200))}`);
    }
  }

  #parseSse(raw, expectId) {
    const lines = raw.split('\n');
    const events = [];
    let data = [];
    for (const line of lines) {
      if (line.startsWith('data:')) {
        data.push(line.slice(5).trim());
      } else if (line.trim() === '' && data.length) {
        events.push(data.join('\n'));
        data = [];
      }
    }
    if (data.length) events.push(data.join('\n'));

    for (const evt of events.reverse()) {
      try {
        const obj = JSON.parse(evt);
        if (obj.id === expectId || obj.result) return obj;
      } catch { /* skip non-json event */ }
    }
    throw new McpError('SSE 响应中未找到有效 JSON-RPC 消息');
  }

  async initialize() {
    const res = await this.#post({
      jsonrpc: '2.0',
      id: ++this.requestId,
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'mcverse-lab', version: '1.0.0' },
      },
    });
    if (res.error) {
      throw new McpError(`initialize 失败: ${redact(JSON.stringify(res.error))}`, {
        code: res.error.code,
      });
    }
    // notifications/initialized：无需响应，失败不阻塞
    try {
      await this.#post({ jsonrpc: '2.0', method: 'notifications/initialized' });
    } catch { /* 通知失败不阻塞 */ }
    this.initialized = true;
    return res.result;
  }

  /** 工具发现：返回 [{name, description}]。不假定任何工具一定存在。 */
  async listTools(force = false) {
    if (!this.initialized) await this.initialize();
    if (this.toolsCache && !force) return this.toolsCache;
    const res = await this.#post({
      jsonrpc: '2.0',
      id: ++this.requestId,
      method: 'tools/list',
      params: {},
    });
    if (res.error) {
      throw new McpError(`tools/list 失败: ${redact(JSON.stringify(res.error))}`, {
        code: res.error.code,
      });
    }
    this.toolsCache = (res.result?.tools || []).map((t) => ({
      name: t.name,
      description: t.description || '',
    }));
    return this.toolsCache;
  }

  async hasTool(name) {
    const tools = await this.listTools();
    return tools.some((t) => t.name === name);
  }

  /**
   * 调用工具。只读白名单之外的任何工具直接拒绝（代码级安全闸）。
   * @returns {any} 结构化内容（优先解析 text 内容中的 JSON）
   */
  async callTool(name, args = {}) {
    if (!READ_ONLY_TOOLS.has(name)) {
      throw new McpError(`安全拦截：${name} 不在只读白名单内，本项目禁止调用`);
    }
    if (!this.initialized) await this.initialize();
    const res = await this.#post({
      jsonrpc: '2.0',
      id: ++this.requestId,
      method: 'tools/call',
      params: { name, arguments: args },
    });
    if (res.error) {
      throw new McpError(`工具 ${name} 调用失败: ${redact(JSON.stringify(res.error))}`, {
        code: res.error.code,
      });
    }
    const result = res.result || {};
    if (result.isError) {
      const text = result.content?.[0]?.text || 'unknown tool error';
      throw new McpError(`工具 ${name} 返回错误: ${redact(text.slice(0, 200))}`);
    }

    // 解析 content：优先返回结构化 JSON，否则返回文本
    const content = result.content || [];
    const textItem = content.find((c) => c.type === 'text');
    if (textItem?.text) {
      try {
        return { __json: JSON.parse(textItem.text), __text: textItem.text };
      } catch {
        return { __text: textItem.text };
      }
    }
    return { __structured: result.structuredContent ?? content };
  }
}
