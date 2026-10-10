import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreQuiz, allAnswerCombinations, PERSONAS, PERSONA_IDS, QUIZ, TIE_BREAK_ORDER,
} from '../src/persona.js';

test('题库结构：4 题 × 4 选项，选项均有主人格', () => {
  assert.equal(QUIZ.length, 4);
  for (const q of QUIZ) {
    assert.equal(q.options.length, 4, `${q.id} 必须有 4 个选项`);
    for (const opt of q.options) {
      assert.ok(PERSONA_IDS.includes(opt.primary), `主人格 ${opt.primary} 必须存在`);
      if (opt.secondary) assert.ok(PERSONA_IDS.includes(opt.secondary));
    }
  }
});

test('评分确定性：相同输入永远相同输出', () => {
  const a = scoreQuiz([0, 1, 2, 3]);
  for (let i = 0; i < 20; i++) {
    const b = scoreQuiz([0, 1, 2, 3]);
    assert.deepEqual(b, a);
  }
});

test('六种人格均可被触发（遍历全部 256 种组合）', () => {
  const winners = new Set();
  for (const combo of allAnswerCombinations()) {
    winners.add(scoreQuiz(combo).personaId);
  }
  assert.deepEqual(
    [...winners].sort(),
    [...PERSONA_IDS].sort(),
    `六种人格都必须可达，实际只出现: ${[...winners]}`
  );
});

test('非法输入抛出清晰错误', () => {
  assert.throws(() => scoreQuiz([0, 1, 2]));        // 长度不够
  assert.throws(() => scoreQuiz([0, 1, 2, 9]));     // 选项越界
  assert.throws(() => scoreQuiz('0012'));           // 非数组
});

test('平分规则：同分时按 TIE_BREAK_ORDER 固定优先', () => {
  // 构造一个必然同分的输入并验证稳定性
  const result1 = scoreQuiz([0, 0, 0, 0]);
  const result2 = scoreQuiz([0, 0, 0, 0]);
  assert.equal(result1.personaId, result2.personaId);
  if (result1.isTie) {
    const maxScore = Math.max(...Object.values(result1.scores));
    const tied = PERSONA_IDS.filter((id) => result1.scores[id] === maxScore);
    // 胜者必须是同分者中 TIE_BREAK_ORDER 最靠前的
    const expected = tied.sort(
      (a, b) => TIE_BREAK_ORDER.indexOf(a) - TIE_BREAK_ORDER.indexOf(b)
    )[0];
    assert.equal(result1.personaId, expected);
  }
});

test('人格元数据完整（名称/英文名/类型/宣传语）', () => {
  for (const p of Object.values(PERSONAS)) {
    assert.ok(p.name && p.en && p.movieGenre && p.tagline, `${p.id} 元数据不完整`);
  }
});
