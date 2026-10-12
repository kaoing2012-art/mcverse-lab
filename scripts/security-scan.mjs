/**
 * 安全自检脚本：扫描仓库中的凭证泄露风险
 *
 * 用法：node scripts/security-scan.mjs
 * 退出码：0 = 干净；1 = 发现疑似真实凭证
 *
 * 检查项：
 * 1. 已知真实 Token 值（从 $MCD_MCP_TOKEN 或 ~/.config/mcd/mcp_token 读取，仅比对不入输出）
 * 2. 常见凭证格式（Bearer 长串 / ghp_ / github_pat_ / sk- / AKIA 等）
 * 3. 高风险文件名（.env、mcp_token、*.token、*.pem、*.key 等）
 *
 * 安全约束：本脚本只输出「文件名 + 凭证类型」，绝不输出匹配内容本身
 * （任何长度的前缀也不行）。
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { homedir } from 'node:os';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'coverage']);

const PATTERNS = [
  { name: 'Bearer 长串', re: /Bearer\s+[A-Za-z0-9._-]{20,}/ },
  { name: 'GitHub PAT (ghp_)', re: /ghp_[A-Za-z0-9]{20,}/ },
  { name: 'GitHub PAT (github_pat_)', re: /github_pat_[A-Za-z0-9_]{20,}/ },
  { name: 'OpenAI/通用 sk-', re: /sk-[A-Za-z0-9]{20,}/ },
  { name: 'AWS AKIA', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'JWT', re: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\./ },
];

const RISKY_FILENAMES = /^\.env$|^\.env\.(?!example)|mcp_token|\.token$|\.pem$|\.key$|credentials?\.json$/i;

// 白名单：用于测试脱敏函数的假值
const ALLOWLIST = ['super-secret-token-123', 'YOUR_MCP_TOKEN', 'dummy-token'];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// 读取真实 Token 用于精确比对（绝不打印其内容）
function realTokens() {
  const list = [];
  if (process.env.MCD_MCP_TOKEN) list.push(process.env.MCD_MCP_TOKEN.trim());
  try {
    list.push(readFileSync(join(homedir(), '.config', 'mcd', 'mcp_token'), 'utf8').trim());
  } catch { /* 无本地 Token 文件 */ }
  return list.filter((t) => t && t.length >= 8);
}

const files = walk(ROOT);
const tokens = realTokens();
const findings = [];

for (const f of files) {
  const rel = relative(ROOT, f);
  if (RISKY_FILENAMES.test(basename(f))) findings.push({ rel, why: '高风险文件名' });

  let text;
  try { text = readFileSync(f, 'utf8'); } catch { continue; }

  for (const t of tokens) {
    if (text.includes(t)) findings.push({ rel, why: '包含真实 MCP Token 值' });
  }
  for (const { name, re } of PATTERNS) {
    const m = text.match(re);
    if (m && !ALLOWLIST.some((a) => m[0].includes(a))) {
      findings.push({ rel, why: `匹配到${name}` });   // 只记类型，不记内容
    }
  }
}

console.log(`扫描文件数: ${files.length}`);
console.log(`真实 Token 比对源: ${tokens.length ? `${tokens.length} 个（内容不显示）` : '未配置'}`);
console.log('');
if (!findings.length) {
  console.log('✅ 未发现凭证泄露风险');
  process.exit(0);
}
console.log('⚠️ 发现疑似风险:');
for (const f of findings) console.log(`  - ${f.rel} → ${f.why}`);
process.exit(1);
