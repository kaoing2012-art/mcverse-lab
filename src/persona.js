/**
 * McVerse Lab —— 人格测试与评分模块
 *
 * 设计原则：
 * - 确定性：相同答案永远得到相同人格（纯函数，无随机、无时间依赖）。
 * - 可解释：每道题的每个选项按「主人格 +2 / 辅人格 +1」计分，结果可追溯。
 * - 平分有解：总分相同时按固定优先级 TIE_BREAK_ORDER 取胜者，绝不含糊。
 *
 * 本测试仅用于娱乐，不构成任何科学心理诊断。
 */

export const PERSONAS = {
  P1: {
    id: 'P1',
    name: '天生主角型',
    en: 'The Born Lead',
    tagline: '镜头一生下来就跟着你走',
    movieGenre: '动作传记片',
    color: '#e0b25c',
  },
  P2: {
    id: 'P2',
    name: '热血冒险型',
    en: 'The Blaze Runner',
    tagline: '辣是燃料，冲是本能',
    movieGenre: '热血动作片',
    color: '#c8102e',
  },
  P3: {
    id: 'P3',
    name: '温柔治愈型',
    en: 'The Comfort Reel',
    tagline: '你是别人世界里的一场好天气',
    movieGenre: '治愈日常片',
    color: '#f4a9a0',
  },
  P4: {
    id: 'P4',
    name: '冷静智谋型',
    en: 'The Cold Strategist',
    tagline: '所有人还在翻菜单，你已经算完了',
    movieGenre: '悬疑智斗片',
    color: '#7fa8c9',
  },
  P5: {
    id: 'P5',
    name: '快乐社交型',
    en: 'The Party Ensemble',
    tagline: '你的餐桌永远坐得下第六个人',
    movieGenre: '群像喜剧片',
    color: '#f2c14e',
  },
  P6: {
    id: 'P6',
    name: '自由浪漫型',
    en: 'The Free Spirit',
    tagline: '你的路线图是一张餐巾纸的背面',
    movieGenre: '公路浪漫片',
    color: '#b58cc9',
  },
};

export const PERSONA_IDS = Object.keys(PERSONAS);

/**
 * 平分优先级规则（固定，不可随机）：
 * 当多个人格总分相同时，按以下顺序取先者。
 * 语义：越靠前代表该特质在四个测试维度（行动力/社交/情绪/电影偏好）中
 * 与「电影叙事的核心驱动」关联更直接，出现同分时优先成立。
 */
export const TIE_BREAK_ORDER = ['P1', 'P2', 'P4', 'P5', 'P6', 'P3'];

/**
 * 四道题。每题四个选项，每个选项：
 * primary: 主人格 +2 分
 * secondary: 辅人格 +1 分（可为 null）
 */
export const QUIZ = [
  {
    id: 'Q1',
    dimension: '行动力',
    question: '周五晚上 9 点，你突然特别想吃麦当劳，此刻的你：',
    options: [
      {
        text: '抓起外套就出门，路上再想吃什么',
        primary: 'P2',
        secondary: 'P1',
      },
      {
        text: '先在群里喊一嗓子，看谁响应就约谁',
        primary: 'P5',
        secondary: 'P2',
      },
      {
        text: '打开 App 认真比券，把配送费和满减都算明白',
        primary: 'P4',
        secondary: null,
      },
      {
        text: '窝进毯子慢慢想，想吃的那口最好自己送到嘴边',
        primary: 'P3',
        secondary: 'P6',
      },
    ],
  },
  {
    id: 'Q2',
    dimension: '社交偏好',
    question: '你理想的麦当劳用餐画面是：',
    options: [
      {
        text: '一桌朋友，薯条传着吃，笑声比吸管还多',
        primary: 'P5',
        secondary: 'P1',
      },
      {
        text: '一个人靠窗，全世界都别来打扰',
        primary: 'P6',
        secondary: 'P3',
      },
      {
        text: '拉上最铁的那个人，边吃边把最近的事聊透',
        primary: 'P1',
        secondary: 'P5',
      },
      {
        text: '打包带走，用最短时间解决，时间也是成本',
        primary: 'P4',
        secondary: 'P2',
      },
    ],
  },
  {
    id: 'Q3',
    dimension: '情绪表达',
    question: '工作/学习搞砸的那个下午，你走进了麦当劳：',
    options: [
      {
        text: '点一份最熟悉的套餐，熟悉的味道路过一下就好',
        primary: 'P3',
        secondary: null,
      },
      {
        text: '点一份辣的，嚼着嚼着就咽下去了，明天再战',
        primary: 'P2',
        secondary: 'P1',
      },
      {
        text: '坐在角落复盘：这次哪里判断错了，下次怎么赢',
        primary: 'P4',
        secondary: null,
      },
      {
        text: '加点个平时舍不得的甜筒——生活嘛，得给自己找甜',
        primary: 'P6',
        secondary: 'P3',
      },
    ],
  },
  {
    id: 'Q4',
    dimension: '电影风格偏好',
    question: '如果把你的人生拍成电影，你希望它是：',
    options: [
      {
        text: '大制作动作片，主角永远站在风暴中心',
        primary: 'P1',
        secondary: 'P2',
      },
      {
        text: '热血燃向片，一路升级打怪，BGM 从不停',
        primary: 'P2',
        secondary: null,
      },
      {
        text: '治愈系日常片，镜头慢慢摇，日子慢慢过',
        primary: 'P3',
        secondary: 'P5',
      },
      {
        text: '悬疑智斗片，观众到最后一刻才猜到我下一步',
        primary: 'P4',
        secondary: null,
      },
    ],
  },
];

/** 补全第四维：自由浪漫型与快乐社交型在 Q4 需有触达路径。
 * Q4 覆盖 P1/P2/P3/P4，P5、P6 由前三题的 secondary 覆盖；
 * 若四题全选含 P5/P6 secondary 的组合仍不足以登顶，
 * 依赖下方分数累加 + 平分规则兜底，测试用例保证六人格可达。 */

/**
 * 计分函数（纯函数）。
 * @param {string[]} answers - 长度为 4 的选项索引数组（0-3），answers[i] 对应 QUIZ[i]
 * @returns {{scores: Object, personaId: string, persona: Object, detail: Array}}
 */
export function scoreQuiz(answers) {
  if (!Array.isArray(answers) || answers.length !== QUIZ.length) {
    throw new Error(`answers 必须是长度为 ${QUIZ.length} 的数组`);
  }

  const scores = {};
  for (const id of PERSONA_IDS) scores[id] = 0;

  const detail = [];
  answers.forEach((optIdx, qIdx) => {
    const q = QUIZ[qIdx];
    if (!Number.isInteger(optIdx) || optIdx < 0 || optIdx >= q.options.length) {
      throw new Error(`第 ${qIdx + 1} 题选项索引非法: ${optIdx}`);
    }
    const opt = q.options[optIdx];
    scores[opt.primary] += 2;
    if (opt.secondary) scores[opt.secondary] += 1;
    detail.push({ questionId: q.id, dimension: q.dimension, optionIndex: optIdx });
  });

  // 排序：分数降序；同分时按 TIE_BREAK_ORDER 的固定优先级
  const winner = [...PERSONA_IDS].sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return TIE_BREAK_ORDER.indexOf(a) - TIE_BREAK_ORDER.indexOf(b);
  })[0];

  return {
    scores,
    personaId: winner,
    persona: PERSONAS[winner],
    detail,
    isTie: isTie(scores, winner),
  };
}

function isTie(scores, winnerId) {
  return PERSONA_IDS.filter((id) => id !== winnerId && scores[id] === scores[winnerId]).length > 0;
}

/**
 * 枚举全部 4^4 = 256 种答案组合（用于测试覆盖率验证）。
 */
export function* allAnswerCombinations() {
  const [q1, q2, q3, q4] = QUIZ.map((q) => q.options.length);
  for (let a = 0; a < q1; a++)
    for (let b = 0; b < q2; b++)
      for (let c = 0; c < q3; c++)
        for (let d = 0; d < q4; d++) yield [a, b, c, d];
}
