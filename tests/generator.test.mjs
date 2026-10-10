import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateCharacter, generatePosterPrompts, generateStoryboard, exportResultText,
} from '../src/generator.js';

const PERSONA_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

test('角色档案结构完整（六人格逐一验证）', () => {
  for (const pid of PERSONA_IDS) {
    const c = generateCharacter(pid, '巨无霸');
    assert.ok(c.movieTitle.includes('巨无霸'), `${pid} 片名应含餐品名`);
    assert.ok(c.movieGenre);
    assert.ok(c.protagonistIdentity);
    assert.ok(c.classicQuote.includes('巨无霸'));
    assert.ok(c.shareCopy);
    // 角色简介字数 80-120（去空白后计数）
    const len = c.characterIntro.replace(/\s/g, '').length;
    assert.ok(len >= 80 && len <= 120, `${pid} 简介字数 ${len} 不在 80-120 区间`);
  }
});

test('生成确定性：同输入同输出', () => {
  const a = JSON.stringify(generateCharacter('P3', '麦旋风'));
  for (let i = 0; i < 5; i++) {
    assert.equal(JSON.stringify(generateCharacter('P3', '麦旋风')), a);
  }
});

test('海报提示词：中英双语、包含画幅与负面提示词', () => {
  for (const pid of PERSONA_IDS) {
    const p = generatePosterPrompts(pid, '板烧鸡腿堡');
    assert.ok(p.zh.includes('竖版 3:4'), `${pid} 中文提示词需含画幅`);
    assert.ok(p.zh.includes('负面提示词'));
    assert.ok(p.zh.includes('板烧鸡腿堡'));
    assert.ok(p.en.includes('3:4'));
    assert.ok(p.en.includes('Negative prompt'));
  }
});

test('分镜：5 镜 × 3 秒，时间码正确且连续', () => {
  for (const pid of PERSONA_IDS) {
    const s = generateStoryboard(pid, '薯条', '《测试片名》');
    assert.equal(s.length, 5);
    const expected = ['00:00-00:03', '00:03-00:06', '00:06-00:09', '00:09-00:12', '00:12-00:15'];
    s.forEach((shot, i) => {
      assert.equal(shot.timecode, expected[i], `${pid} 镜头${i + 1} 时间码错误`);
      assert.equal(shot.duration, '3秒');
      assert.ok(shot.content, '画面内容不能为空');
      assert.ok(shot.camera && shot.light && shot.sfx, '运镜/灯光/音效不能为空');
      assert.ok(shot.aiPrompt, 'AI 视频提示词不能为空');
    });
    // 叙事结构：第 1 镜悬念、第 5 镜含片名
    assert.ok(s[4].content.includes('片名'));
  }
});

test('导出文本包含全部关键区块与 Demo 标注', () => {
  const result = {
    source: 'demo',
    character: generateCharacter('P1', '巨无霸'),
    meal: { item: { name: '巨无霸' } },
    poster: generatePosterPrompts('P1', '巨无霸'),
    storyboard: generateStoryboard('P1', '巨无霸', '《巨无霸：今夜加冕》'),
  };
  const text = exportResultText(result);
  assert.ok(text.includes('DEMO 模式'));
  assert.ok(text.includes('海报提示词'));
  assert.ok(text.includes('15 秒预告片分镜'));
  assert.ok(text.includes('非麦当劳官方出品'));
});
