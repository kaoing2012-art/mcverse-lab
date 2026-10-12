/**
 * McVerse Lab —— 本地演示服务器（零依赖）
 *
 * - 静态托管 public/（HTML Demo）
 * - POST /api/quiz：在服务端执行 MCP 调用，Token 永不出现在浏览器
 * - GET  /api/health：健康检查（不泄露 Token 内容，只返回是否有配置）
 *
 * 启动：node src/server.js  （或 npm start）
 * Token 设置：环境变量 MCD_MCP_TOKEN，或文件 ~/.config/mcd/mcp_token
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPipeline, exportResultText } from './pipeline.js';
import { loadToken } from './mcp-client.js';
import { QUIZ, PERSONAS, TIE_BREAK_ORDER } from './persona.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT || process.env.MCVERSE_PORT || 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/quiz' && req.method === 'GET') {
    // 题库下发：前端永不复制题干，保证与评分逻辑单一数据源
    return sendJson(res, 200, { quiz: QUIZ, personas: PERSONAS, tieBreakOrder: TIE_BREAK_ORDER });
  }

  if (url.pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      mcpConfigured: Boolean(loadToken()),
      mcpEndpointConfigured: true,
    });
  }

  if (url.pathname === '/api/quiz' && req.method === 'POST') {
    try {
      const { answers, location } = await readBody(req);
      const result = await runPipeline(answers, { location });
      result.exportedText = exportResultText(result);
      // debug 里不含任何敏感信息（mcp-client 层已做脱敏）
      return sendJson(res, 200, result);
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: err.message });
    }
  }

  // 静态文件
  let filePath = join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
});

server.listen(PORT, () => {
  const hasToken = Boolean(loadToken());
  console.log(`McVerse Lab 已启动: http://localhost:${PORT}`);
  console.log(`MCP Token 状态: ${hasToken ? '已配置（真实数据模式可用）' : '未配置（将进入 DEMO 模式）'}`);
  console.log('Token 只存在于服务端进程，浏览器永远拿不到。');
});
