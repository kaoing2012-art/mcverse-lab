/**
 * docs 预览图生成器（仅用于生成 README 展示素材，不影响产品代码）
 *
 * 背景：本机无头浏览器截图只能拿到首帧，动态状态截不到。
 * 方案：用真实 style.css + 真实（live）MCP 数据生成静态预览页，
 *       首帧即内容，截图稳定命中。
 *
 * 用法：node scripts/build-previews.mjs   （需本地服务器已启动）
 * 产出：docs/preview/*.html
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'docs', 'preview');
mkdirSync(OUT, { recursive: true });

const PERSONAS = [
  { key: 'p1', answers: [0, 0, 0, 0], label: '天生主角型' },
  { key: 'p2', answers: [0, 2, 1, 1], label: '热血冒险型' },
  { key: 'p3', answers: [3, 1, 0, 3], label: '温柔治愈型' },
];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** 生成结果区静态标记（结构对齐 public/index.html 的 #scene-result） */
function resultScene(r, personas) {
  const scores = Object.entries(r.scores)
    .map(([pid, s]) => `<div class="score-cell"><div class="n">${s}</div><div class="l">${esc(personas[pid]?.name || pid)}</div></div>`)
    .join('');

  const shots = r.storyboard.map((s) => `
      <div class="shot">
        <div class="shot-head">
          <span class="shot-no">镜头 ${s.shot}</span>
          <span class="shot-tc">${s.timecode}</span>
          <span class="shot-size">${s.size}</span>
        </div>
        <p class="shot-content">${esc(s.content)}</p>
        <p class="shot-meta">运镜：${esc(s.camera)}｜灯光：${esc(s.light)}｜音效：${esc(s.sfx)}</p>
        <pre class="shot-prompt">${esc(s.aiPrompt)}</pre>
      </div>`).join('');

  return `
<section id="scene-result" class="scene active">
  <article class="card persona-card">
    <p class="card-kicker">你的麦门电影人格</p>
    <h2 class="persona-name">${esc(r.character.personaName)}</h2>
    <p class="persona-en">${esc(r.character.personaEn)}</p>
    <p class="persona-tagline">${esc(r.character.tagline)}</p>
    <div class="score-grid">${scores}</div>
    <p class="source-badge ${r.source}">${esc(r.sourceLabel)}</p>
  </article>

  <article class="card movie-card">
    <p class="card-kicker">你的专属电影</p>
    <div class="poster-frame">
      <p class="movie-title">${esc(r.character.movieTitle)}</p>
      <p class="movie-genre">${esc(r.character.movieGenre)}</p>
    </div>
    <dl class="kv">
      <dt>匹配餐品</dt><dd>${esc(r.meal.item.name)}（匹配度 ${r.meal.score} 分）</dd>
      <dt>主角身份</dt><dd>${esc(r.character.protagonistIdentity)}</dd>
      <dt>角色简介</dt><dd>${esc(r.character.characterIntro)}</dd>
      <dt>经典台词</dt><dd class="quote">${esc(r.character.classicQuote)}</dd>
      <dt>分享文案</dt><dd class="share">${esc(r.character.shareCopy)}</dd>
    </dl>
  </article>

  <article class="card prompt-card">
    <p class="card-kicker">电影海报提示词（可直接复制去生图）</p>
    <div class="tabs"><button class="tab active">中文版</button><button class="tab">English</button></div>
    <pre class="prompt-box">${esc(r.poster.zh)}</pre>
  </article>

  <article class="card storyboard-card">
    <p class="card-kicker">15 秒预告片分镜（5 镜 × 3 秒）</p>
    <div class="shot-list">${shots}</div>
  </article>

  <article class="card export-card">
    <p class="card-kicker">带走你的电影档案</p>
    <div class="btn-row">
      <button class="btn btn-primary">导出 TXT</button>
      <button class="btn btn-primary">导出 JSON</button>
      <button class="btn btn-ghost">再测一次</button>
    </div>
    <p class="disclaimer">本页面为娱乐创作，非麦当劳官方出品；餐品信息以麦当劳官方渠道为准。</p>
  </article>

  <article class="card star-card">
    <p class="card-kicker">喜欢这个脑洞？</p>
    <p class="star-text">项目已开源，正在参加 2026 麦当劳程序员创意开发大赛。<br />你的 Star 就是我们的票房。</p>
    <a class="btn btn-star" href="https://github.com/kaoing2012-art/mcverse-lab">⭐ Star on GitHub</a>
  </article>
</section>`;
}

const page = (cssPath, body, extraStyle = '') => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>McVerse Lab 预览</title>
<link rel="stylesheet" href="${cssPath}" />
<style>body{background:var(--bg)}${extraStyle}</style>
</head>
<body>
${body}
</body>
</html>`;

const quiz = await (await fetch('http://localhost:3000/api/quiz')).json();
const personas = quiz.personas;

for (const p of PERSONAS) {
  const res = await fetch('http://localhost:3000/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: p.answers }),
  });
  const r = await res.json();
  writeFileSync(join(OUT, `${p.key}-result.html`),
    page('../../public/style.css', resultScene(r, personas)));
  console.log(`✓ ${p.key}-result.html  ${r.character.personaName} → ${r.meal.item.name}（${r.source}）`);

  // 手机视图：把同一份结果放进 390px 宽的机身里
  const phone = `
<div style="min-height:100vh;background:#08070b;display:flex;justify-content:center;padding:26px 0">
  <div style="width:390px;background:var(--bg);border:8px solid #24222c;border-radius:34px;overflow:hidden;box-shadow:0 22px 70px rgba(0,0,0,.7)">
    ${resultScene(r, personas)}
  </div>
</div>`;
  writeFileSync(join(OUT, `${p.key}-mobile.html`),
    page('../../public/style.css', phone, '.scene{padding:20px 12px 40px}'));
}
console.log('完成，输出目录: docs/preview/');
