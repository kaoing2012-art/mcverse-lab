/**
 * 一键发布到 GitHub（创建仓库 + 首次推送）
 *
 * 用法（Token 通过环境变量传入，脚本不会打印它）：
 *   GITHUB_TOKEN=xxx node scripts/publish-to-github.mjs <owner> <repo>
 *   例：GITHUB_TOKEN=xxx node scripts/publish-to-github.mjs kaoing2012-art mcverse-lab
 *
 * 行为：
 * 1. 用 GitHub REST API 检查仓库是否存在；不存在则尝试创建（需带 repo 权限的 classic PAT）
 * 2. 若创建因权限不足失败 → 给出「先在网页建仓库」的明确提示后退出
 * 3. 配置 remote 并 push main 分支
 * 4. 结束后把 remote URL 还原为不含凭证的干净地址
 *
 * 安全：Token 只从环境变量读取，不写入任何文件，不打印。
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const GIT = 'C:/Users/EDY/.workbuddy/binaries/PortableGit/versions/1.2.0/cmd/git.exe';
const gitBin = existsSync(GIT) ? GIT : 'git';

const [owner, repo] = process.argv.slice(2);
const token = process.env.GITHUB_TOKEN;

if (!owner || !repo) {
  console.error('用法: GITHUB_TOKEN=xxx node scripts/publish-to-github.mjs <owner> <repo>');
  process.exit(1);
}
if (!token) {
  console.error('缺少环境变量 GITHUB_TOKEN');
  process.exit(1);
}

const api = (path, init = {}) => fetch(`https://api.github.com${path}`, {
  ...init,
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'mcverse-lab-publisher',
    ...(init.headers || {}),
  },
});

function git(args, opts = {}) {
  return execFileSync(gitBin, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
}

// 1. 仓库是否存在
let exists = false;
const check = await api(`/repos/${owner}/${repo}`);
if (check.status === 200) {
  exists = true;
  console.log(`仓库已存在: ${owner}/${repo}`);
} else if (check.status === 404) {
  console.log('仓库不存在，尝试创建…');
  const create = await api('/user/repos', {
    method: 'POST',
    body: JSON.stringify({
      name: repo,
      description: 'McVerse Lab 麦门电影宇宙 —— 麦当劳 MCP × 人格测试 × AI 电影创作（2026 麦当劳程序员创意开发大赛参赛作品）',
      private: false,
      has_issues: true,
      auto_init: false,
    }),
  });
  if (create.status === 201) {
    exists = true;
    console.log('✅ 仓库创建成功（Public）');
  } else {
    const body = await create.json().catch(() => ({}));
    console.error(`❌ 创建失败 (HTTP ${create.status}): ${body.message || ''}`);
    console.error('→ 若使用的是细粒度 Token，请先在 https://github.com/new 手动创建同名 Public 仓库（不要勾选 Add README），再重跑本脚本。');
    process.exit(1);
  }
} else {
  console.error(`❌ 检查仓库失败: HTTP ${check.status}`);
  process.exit(1);
}

// 2. remote
const cleanUrl = `https://github.com/${owner}/${repo}.git`;
const authUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
try { git(['remote', 'remove', 'origin']); } catch { /* 无 origin */ }
git(['remote', 'add', 'origin', cleanUrl]);

// 3. push（凭证只在本次命令的临时 URL 中出现，不落盘）
console.log('推送 main 分支…');
try {
  const out = git(['push', authUrl, 'main:main', '--set-upstream'], {});
  console.log(out.split('\n').filter((l) => !l.includes(token)).join('\n') || 'push 完成');
} catch (err) {
  const msg = String(err.stderr || err.message || '').split(token).join('***');
  console.error('❌ push 失败:', msg);
  process.exit(1);
}

// 4. 校验
try {
  git(['remote', 'set-url', 'origin', cleanUrl]);
  console.log('remote origin 已还原为干净地址:', git(['remote', 'get-url', 'origin']));
} catch { /* 忽略 */ }
const after = await api(`/repos/${owner}/${repo}`);
if (after.ok) {
  const info = await after.json();
  console.log(`✅ 仓库地址: ${info.html_url}`);
  console.log(`✅ 可见性: ${info.private ? 'Private' : 'Public'}`);
  console.log(`✅ 默认分支: ${info.default_branch}`);
}
