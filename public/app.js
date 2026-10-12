/* McVerse Lab —— 前端交互逻辑（零依赖） */
(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const state = { answers: [null, null, null, null], quiz: null, result: null };

  /* ---------- 场景切换 ---------- */
  function show(sceneId) {
    document.querySelectorAll('.scene').forEach((s) => s.classList.remove('active'));
    $(sceneId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  /* ---------- 复制 ---------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('已复制 ✓');
    } catch {
      // 兼容非 https 环境
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); ta.remove();
      toast('已复制 ✓');
    }
  }

  /* ---------- Showcase「我也想试镜」→ 触发开始 ---------- */
  document.querySelectorAll('[data-goto-quiz]').forEach((b) => {
    b.addEventListener('click', () => $('#btn-start').click());
  });

  /* ---------- 启动 ---------- */
  $('#btn-start').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/quiz');
      state.quiz = await res.json();
    } catch {
      toast('无法连接服务，请先运行 node src/server.js');
      return;
    }
    renderQuiz();
    show('#scene-quiz');
  });

  /* ---------- 渲染题目 ---------- */
  const LETTERS = ['A', 'B', 'C', 'D'];
  function renderQuiz() {
    const wrap = $('#quiz-list');
    wrap.innerHTML = '';
    state.quiz.quiz.forEach((q, qi) => {
      const block = document.createElement('div');
      block.className = 'q-block';
      const dim = document.createElement('p');
      dim.className = 'q-dim'; dim.textContent = `Q${qi + 1} · ${q.dimension}`;
      const title = document.createElement('p');
      title.className = 'q-title'; title.textContent = q.question;
      const opts = document.createElement('div');
      opts.className = 'q-options';
      q.options.forEach((opt, oi) => {
        const btn = document.createElement('button');
        btn.className = 'q-opt'; btn.type = 'button';
        btn.innerHTML = `<span class="tag">${LETTERS[oi]}</span><span></span>`;
        btn.lastElementChild.textContent = opt.text;
        btn.addEventListener('click', () => {
          state.answers[qi] = oi;
          opts.querySelectorAll('.q-opt').forEach((b) => b.classList.remove('picked'));
          btn.classList.add('picked');
          updateProgress();
        });
        opts.appendChild(btn);
      });
      block.append(dim, title, opts);
      wrap.appendChild(block);
    });
    updateProgress();
  }

  function updateProgress() {
    const done = state.answers.filter((a) => a !== null).length;
    $('#quiz-progress').style.width = `${(done / 4) * 100}%`;
    $('#btn-submit').disabled = done < 4;
    // 胶片格：已答 = done，当前格 = current
    document.querySelectorAll('#filmstrip .frame').forEach((f, i) => {
      f.classList.toggle('done', state.answers[i] !== null);
      f.classList.toggle('current', state.answers[i] === null && i === done);
    });
  }

  /* ---------- 提交 ---------- */
  const LOAD_STEPS = [
    ['正在打开场灯…', '连接麦当劳 MCP，读取真实菜单'],
    ['正在选角…', '六位候选人试镜中'],
    ['正在勘景…', '深夜的麦当劳，光影刚好'],
    ['正在写分镜…', '5 镜 × 3 秒，一镜都不将就'],
  ];
  let loadTimer;

  $('#btn-submit').addEventListener('click', async () => {
    if (state.answers.some((a) => a === null)) return;
    show('#scene-loading');
    let step = 0;
    const tick = () => {
      const [t, d] = LOAD_STEPS[step % LOAD_STEPS.length];
      $('#loading-text').textContent = t;
      $('#loading-detail').textContent = d;
      step += 1;
    };
    tick();
    loadTimer = setInterval(tick, 1400);

    const started = Date.now();
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: state.answers }),
      });
      if (!res.ok) throw new Error((await res.json()).error || '生成失败');
      state.result = await res.json();
    } catch (err) {
      clearInterval(loadTimer);
      toast(`出错了：${err.message}`);
      show('#scene-quiz');
      return;
    }
    // 至少展示 2.4s 加载动画，避免闪屏
    const wait = Math.max(0, 2400 - (Date.now() - started));
    setTimeout(() => { clearInterval(loadTimer); renderResult(); show('#scene-result'); }, wait);
  });

  /* ---------- 渲染结果 ---------- */
  function renderResult() {
    const r = state.result;
    // 人格主色环境光：scene-result[data-persona] 驱动 CSS 变量 --persona-accent
    $('#scene-result').dataset.persona = String(r.persona?.id || 'P1');

    $('#r-persona-name').textContent = r.character.personaName;
    $('#r-persona-en').textContent = r.character.personaEn;
    $('#r-persona-tagline').textContent = r.character.tagline;

    const grid = $('#r-scores');
    grid.innerHTML = '';
    Object.entries(r.scores).forEach(([pid, score]) => {
      const cell = document.createElement('div');
      cell.className = 'score-cell';
      cell.innerHTML = '<div class="n"></div><div class="l"></div>';
      cell.querySelector('.n').textContent = score;
      cell.querySelector('.l').textContent = state.quiz?.personas?.[pid]?.name || pid;
      grid.appendChild(cell);
    });

    const badge = $('#r-source');
    badge.textContent = r.sourceLabel;
    badge.className = `source-badge ${r.source}`;

    $('#r-movie-title').textContent = r.character.movieTitle;
    $('#r-movie-genre').textContent = r.character.movieGenre;

    // 海报图：按人格展示 AI 生成的海报（示例图，由本项目提示词产出）
    const pid = String(r.persona?.id || 'P1').toLowerCase();
    const posterPath = `posters/${pid}.jpg`;
    const img = $('#r-poster-img');
    img.onerror = () => { const f = img.closest('.poster-figure'); if (f) f.classList.add('hidden'); };
    img.src = posterPath;
    img.alt = `${r.character.personaName} · ${r.character.movieTitle}（AI 生成示例海报）`;
    const dl = $('#r-poster-download');
    dl.href = posterPath;
    dl.setAttribute('download', `麦门电影宇宙-${r.character.personaName}-海报.jpg`);
    $('#r-meal').textContent = `${r.meal.item.name}（匹配度 ${r.meal.score} 分）` +
      (r.alternativeMeals?.length ? ` · 备选：${r.alternativeMeals.join('、')}` : '');
    $('#r-identity').textContent = r.character.protagonistIdentity;
    $('#r-intro').textContent = r.character.characterIntro;
    $('#r-quote').textContent = r.character.classicQuote;
    $('#r-share').textContent = r.character.shareCopy;

    $('#r-poster-zh').textContent = r.poster.zh;
    $('#r-poster-en').textContent = r.poster.en;

    const sb = $('#r-storyboard');
    sb.innerHTML = '';
    r.storyboard.forEach((s) => {
      const el = document.createElement('div');
      el.className = 'shot';
      el.innerHTML = `
        <div class="shot-head">
          <span class="shot-no">镜头 ${s.shot}</span>
          <span class="shot-tc">${s.timecode}</span>
          <span class="shot-size">${s.size}</span>
        </div>
        <p class="shot-content"></p>
        <p class="shot-meta">运镜：${s.camera}｜灯光：${s.light}｜音效：${s.sfx}</p>
        <pre class="shot-prompt">${escapeHtml(s.aiPrompt)}</pre>`;
      el.querySelector('.shot-content').textContent = s.content;
      sb.appendChild(el);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- 提示词 tab ---------- */
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const isZh = tab.dataset.tab === 'zh';
      $('#r-poster-zh').classList.toggle('hidden', !isZh);
      $('#r-poster-en').classList.toggle('hidden', isZh);
    });
  });

  $('#btn-copy-poster').addEventListener('click', () => {
    const isZh = !$('#r-poster-zh').classList.contains('hidden');
    copyText(isZh ? $('#r-poster-zh').textContent : $('#r-poster-en').textContent);
  });

  /* ---------- 通用复制按钮 ---------- */
  document.querySelectorAll('[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.dataset.copyTarget);
      const text = el.classList.contains('shot-list')
        ? Array.from(el.querySelectorAll('.shot')).map((s) => s.innerText).join('\n\n')
        : el.textContent;
      copyText(text);
    });
  });

  /* ---------- 导出 ---------- */
  function download(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('已导出 ✓');
  }

  $('#btn-export-txt').addEventListener('click', () => {
    if (state.result?.exportedText) download('mcverse-电影档案.txt', state.result.exportedText, 'text/plain;charset=utf-8');
  });
  $('#btn-export-json').addEventListener('click', () => {
    if (state.result) download('mcverse-电影档案.json', JSON.stringify(state.result, null, 2), 'application/json');
  });
  $('#btn-restart').addEventListener('click', () => {
    state.answers = [null, null, null, null];
    show('#scene-hero');
  });
})();
