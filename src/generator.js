/**
 * McVerse Lab —— 电影内容生成模块
 *
 * 全部内容来自固定模板 + 确定性插值（人格 × 餐品名），
 * 相同输入永远产出相同文案，不存在随机性。
 * 文案仅用于娱乐与创作参考，不代表麦当劳官方立场。
 */

import { PERSONAS } from './persona.js';

/** 每个人格的电影宇宙设定。{meal} 为餐品名插值位。 */
export const PERSONA_MOVIE = {
  P1: {
    titleTpl: '《{meal}：今夜加冕》',
    logline: '一个普通人，在深夜的麦当劳被镜头选中成了主角',
    identity: '深夜店的隐形主角，谁进店都以为他是店长',
    introTpl:
      '凌晨的城市按下静音，只有那家店的灯还亮着。{meal}在他手里不是晚餐，是加冕的权杖。他从不需要 C 位——因为镜头自己会找过来。喝完最后一口，把包装纸捏成球，稳稳投进垃圾桶：好戏，正式开场。',
    quoteTpl: '「不是我在吃{meal}，是这部电影等这口等了三十年。」',
    shareTpl: '测出来我是天生主角型，连{meal}在我手里都像道具组精挑的。麦门电影宇宙，今晚开画。',
    poster: {
      subject: '一个人独自坐在麦当劳餐厅正中的长桌前，双手捧起{meal}，微微抬头面向镜头',
      character: '风衣随意搭在椅背，眼神笃定带一点疲惫，像刚下片场的电影主角',
      scene: '深夜麦当劳内景，窗外是虚化的城市灯火',
      composition: '竖版 3:4，中景平视构图，人物居中偏下，头顶留出大面积暗部空间',
      lighting: '顶光为主光源，在面部形成微弱伦勃朗光，背景边缘溢出暖色轮廓光',
      color: '暖金 + 墨蓝双色电影调色，高对比、低饱和暗部',
      texture: '35mm 胶片质感，轻微颗粒，浅景深',
      negative: '文字、水印、logo、多人、卡通、过曝、畸变面部、多余手指',
    },
    shots: {
      hook: '自动门缓缓合上，店里只剩一个人的剪影',
      entrance: '主角拎着{meal}的纸袋走向长桌，步频稳得像配了节拍器',
      conflict: '邻桌投来打量的目光，他头也不抬，直接咬下第一口{meal}',
      climax: '顶光骤亮，慢镜头里酱汁滑落，他终于抬眼看向镜头',
      title: '画面定格成暗金色调，片名浮现',
    },
  },
  P2: {
    titleTpl: '《{meal}疾走》',
    logline: '一口辣，一脚油门，今晚没有刹车',
    identity: '深夜城市的麦辣骑士，胃是油箱，辣是燃料',
    introTpl:
      '别人深夜emo，他深夜点火。{meal}上桌的瞬间像发令枪响——不行，太慢了，站着吃。辣意冲上来的那一秒，世界突然提速，风、霓虹和心跳全部变成同一个节拍。他不是饿了，他是想赢。',
    quoteTpl: '「速度不够的{meal}，配不上今晚的我。」',
    shareTpl: '人格测试说我是热血冒险型，点了个{meal}，现在心跳是这部片的 BGM。',
    poster: {
      subject: '一个奔跑中的年轻人，单手握着{meal}，身后是拉长的霓虹光轨',
      character: '连帽衫被风掀起，嘴角带笑，眼里全是要赢的光',
      scene: '雨后的城市街道，红金色霓虹在湿地上倒映成河',
      composition: '竖版 3:4，低机位仰拍对角线构图，人物冲向画面上缘',
      lighting: '侧逆光勾出人物轮廓，霓虹补光打亮半张脸，雨滴在逆光中发亮',
      color: '麦门红 + 橙金高饱和对撞，暗部压青',
      texture: '运动相机广角质感，动态模糊拖尾，高快门定格主体',
      negative: '静态呆立、文字、水印、模糊面部、廉价感、灰蒙蒙的天空',
    },
    shots: {
      hook: '红灯读秒 3、2、1，一只手攥紧{meal}的包装纸',
      entrance: '绿灯亮起，主角蹬地冲出，外卖袋在手里甩出弧线',
      conflict: '身后车灯骤亮、喇叭齐鸣，他偏头一笑，反而加速',
      climax: '穿过巷口瞬间跃起，{meal}在空中脱手翻转，慢镜头接住',
      title: '落地定格，红色片名砸上屏幕，一声鼓点收尾',
    },
  },
  P3: {
    titleTpl: '《{meal}小馆》',
    logline: '这家店不打烊，专收没说出口的委屈',
    identity: '深夜食堂守灯人，坚信甜的东西能接住眼泪',
    introTpl:
      '她相信一口{meal}的温度刚好够焐热一个崩溃的傍晚。不追问、不劝解，只把甜的那份推到对方面前，说一句：先吃，别的明天再说。在这家店里，治愈不是台词，是递到手心里的温度。',
    quoteTpl: '「{meal}要趁热，难过要趁轻，我先陪你吃完这份。」',
    shareTpl: '测出温柔治愈型——原来我递出去的{meal}，都是别人剧情里的救场镜头。',
    poster: {
      subject: '一杯冒着热气的{meal}摆在靠窗小桌，一只手正轻轻把它推向前',
      character: '画面外的人只露出袖口与手指，指甲干净，动作轻得像怕吵醒什么',
      scene: '雨夜麦当劳靠窗座位，玻璃上有一道蜿蜒的水痕',
      composition: '竖版 3:4，近景特写构图，热气占画面上三分之一形成柔焦',
      lighting: '暖黄台灯侧光为主，窗外冷蓝月光做冷暖对比，热气被逆光点亮',
      color: '奶油黄 + 雾蓝的低对比治愈系调色，柔光溢出',
      texture: '大光圈浅景深，柔焦光斑，数码中画幅细腻质感',
      negative: '冷硬金属感、人脸特写、文字、水印、喧闹人群、高饱和荧光色',
    },
    shots: {
      hook: '雨夜，玻璃门被推开，风铃轻响，热气涌出',
      entrance: '一只手把{meal}轻轻放到小桌上，坐到对面',
      conflict: '对面的人低头不语，热气在两人之间慢慢升起',
      climax: '对方抬头咬了一口，睫毛上的雨水和眼里的光一起化开',
      title: '镜头拉远，暖黄小桌缩成城市里的一格灯，片名浮现',
    },
  },
  P4: {
    titleTpl: '《{meal}博弈》',
    logline: '菜单就是棋盘，而你七步之前已经赢了',
    identity: '券池操盘手，永远知道哪一步是陷阱哪一步是底牌',
    introTpl:
      '所有人还在翻菜单，他已经算完了：满减、配送费、券的叠加顺序、{meal}的最佳出场时机。在他的剧本里，没有随手一点，只有落子无悔。你以为他只是点了个餐——不，他刚刚完成了一局完美收官。',
    quoteTpl: '「这口{meal}，是我七步之前就安排好的终局。」',
    shareTpl: '冷静智谋型实锤。别人看菜单，我看棋盘——{meal}只是我收官的那步棋。',
    poster: {
      subject: '一张被台灯照亮的餐桌，{meal}摆在正中，周围散落着写满数字的收据',
      character: '画面边缘一只手悬在半空，指尖停在收据的某一行数字上',
      scene: '极简深色书房一角，餐桌即棋盘，收据即棋谱',
      composition: '竖版 3:4，俯拍上帝视角构图，{meal}位于黄金分割点',
      lighting: '单侧硬光台灯，收据上投出长阴影，明暗交界线切过画面',
      color: '黑白灰为主，仅{meal}保留真实暖色，形成唯一的色彩焦点',
      texture: '高锐度微距质感，噪点极低，冷静克制的画面',
      negative: '暖色泛滥、杂乱背景、文字水印、笑脸、卡通元素、过柔的光',
    },
    shots: {
      hook: '黑场，只听见笔尖在收据上划过的声音',
      entrance: '台灯亮起，{meal}与一堆收据同时入画，一只手开始排列数字',
      conflict: '手机弹出「库存不足」提示，手指停顿半秒，眼神骤冷',
      climax: ' rapid 蒙太奇：划掉三个方案，最终把{meal}推到画面正中',
      title: '画面收成黑白，只剩{meal}亮着，冷白片名浮现',
    },
  },
  P5: {
    titleTpl: '《{meal}大作战》',
    logline: '一个人点餐是吃饭，一群人点餐是开机',
    identity: '团餐灵魂人物，点单永远多两个人的量',
    introTpl:
      '他的口头禅是「多点一份没人吃亏」。{meal}上桌三秒内必被分配完毕，分配方案还兼顾每个人的口味雷区。笑声、蘸酱和抢最后一块的筷子大战同时发生——在这部群像喜剧里，他就是那个让摄像机永远有东西可拍的中心人物。',
    quoteTpl: '「{meal}我一个人吃是浪费，一桌人吃才是名场面。」',
    shareTpl: '快乐社交型认证。我的{meal}从不属于我一个人——它属于全场最大的那声笑。',
    poster: {
      subject: '一群朋友的手同时伸向桌中央的{meal}，画面定格在即将碰到的瞬间',
      character: '只拍手不拍脸，每只手姿态不同：抢的、让的、拍照的、比耶的',
      scene: '热闹的麦当劳长桌，餐盘纸袋摊成一片欢乐战场',
      composition: '竖版 3:4，俯拍圆形构图，所有手向中心{meal}汇聚',
      lighting: '店内明快顶光 + 暖色补光，每只手都有清晰高光',
      color: '高饱和暖色调，红金为主，像一张过曝的快乐合影',
      texture: '广角轻微畸变增加喜感，色彩鲜明锐利',
      negative: '孤独氛围、冷色调、阴暗光线、空旷画面、文字、水印',
    },
    shots: {
      hook: '门被推开，一整桌人齐刷刷转头看向镜头',
      entrance: '{meal}被高高举起登场，全桌欢呼到音乐差点盖不住',
      conflict: '两双筷子同时夹向最后一块，空气凝固，眼神交锋',
      climax: '镜头突然拉远——原来还有一份，全桌爆笑举杯（举可乐）',
      title: '定格成一张欢乐合影，彩色片名蹦跳着入场',
    },
  },
  P6: {
    titleTpl: '《{meal}流浪记》',
    logline: '没有攻略，没有计划，只有今晚想去的地方',
    identity: '公路诗人，把外卖袋坐成行李箱的人',
    introTpl:
      '他的旅行没有计划，只有一张写着「先吃{meal}」的餐巾纸。站台、天台、没完工的桥下，哪里有落日就在哪里开饭。别人收集景点，他收集风的味道——和每一次不期而遇的、刚好也路过的人。',
    quoteTpl: '「带上{meal}就出发，迷路也算路线的一种。」',
    shareTpl: '自由浪漫型本人。我的行程表是一张餐巾纸，第一站永远是{meal}。',
    poster: {
      subject: '一个背包客坐在天台边缘，手里举着{meal}面向远处的晚霞',
      character: '背影姿态舒展，外套下摆被风吹起，像随时要走又哪都想去',
      scene: '城市天台，远处晚霞把楼群染成粉金色',
      composition: '竖版 3:4，远景剪影构图，地平线压在下三分之一处',
      lighting: '落日逆光为主光源，人物呈半剪影，发丝边缘泛金',
      color: '粉金 + 淡紫渐变的天空调，柔和梦幻但不甜腻',
      texture: '中画幅风光质感，天空层次丰富，画面干净开阔',
      negative: '人群、室内、正面对脸、文字、水印、阴天、压抑构图',
    },
    shots: {
      hook: '火车驶离站台，车窗里一包{meal}孤零零放在空位上',
      entrance: '背包客翻身跃上天台，把{meal}摆在身边的矮墙上',
      conflict: '手机响起，屏幕上是「改签成功」——下一站变了，他笑了',
      climax: '晚霞烧到最亮的一刻，他举起{meal}，像举一杯敬自由的酒',
      title: '镜头升起越过城市，天幕上浮起手写体片名',
    },
  },
};

/** 生成完整电影角色档案 */
export function generateCharacter(personaId, mealName) {
  const persona = PERSONAS[personaId];
  const movie = PERSONA_MOVIE[personaId];
  const meal = mealName || '招牌套餐';
  const title = movie.titleTpl.replaceAll('{meal}', meal);
  return {
    personaName: persona.name,
    personaEn: persona.en,
    tagline: persona.tagline,
    movieTitle: title,
    movieGenre: persona.movieGenre,
    logline: movie.logline,
    protagonistIdentity: movie.identity,
    characterIntro: movie.introTpl.replaceAll('{meal}', meal),
    classicQuote: movie.quoteTpl.replaceAll('{meal}', meal),
    shareCopy: movie.shareTpl.replaceAll('{meal}', meal),
  };
}

/** 生成中英双语海报提示词（竖版 3:4） */
export function generatePosterPrompts(personaId, mealName) {
  const movie = PERSONA_MOVIE[personaId];
  const meal = mealName || '招牌套餐';
  const p = movie.poster;
  const fill = (tpl) => tpl.replaceAll('{meal}', meal);

  const zh = [
    `主体：${fill(p.subject)}`,
    `角色设定：${fill(p.character)}`,
    `场景：${fill(p.scene)}`,
    `景别与构图：${fill(p.composition)}`,
    `灯光方向：${fill(p.lighting)}`,
    `色彩风格：${fill(p.color)}`,
    `镜头质感：${fill(p.texture)}`,
    `画幅比例：竖版 3:4 电影海报`,
    `负面提示词：${p.negative}`,
  ].join('\n');

  const en = [
    `Subject: ${fill(p.subject)} (McDonald's-style burger meal "${meal}" as key prop)`,
    `Character: ${fill(p.character)}`,
    `Scene: ${fill(p.scene)}`,
    `Framing: ${fill(p.composition)}, vertical 3:4 movie poster`,
    `Lighting: ${fill(p.lighting)}`,
    `Color: ${fill(p.color)}`,
    `Texture: ${fill(p.texture)}`,
    `Negative prompt: ${p.negative}`,
  ].join('\n');

  return { zh, en };
}

/** 生成 15 秒预告片分镜（5 镜 × 3 秒） */
export function generateStoryboard(personaId, mealName, movieTitle) {
  const meal = mealName || '招牌套餐';
  const s = PERSONA_MOVIE[personaId].shots;
  const fill = (tpl) => tpl.replaceAll('{meal}', meal);

  const meta = [
    { tc: '00:00-00:03', size: '大远景', camera: '缓慢推进', light: '低照度环境光，剪影效果', sfx: '环境底噪 + 一声遥远的门铃' },
    { tc: '00:03-00:06', size: '中景', camera: '跟拍', light: '侧光渐亮，人物轮廓清晰', sfx: '脚步声 + 鼓点进入' },
    { tc: '00:06-00:09', size: '近景', camera: '手持轻微晃动', light: '明暗对比加强，制造张力', sfx: '低音提琴渐强 + 心跳声' },
    { tc: '00:09-00:12', size: '特写', camera: '慢动作 + 环绕', light: '顶光全开，视觉高潮', sfx: '音乐推向最高点后骤停半拍' },
    { tc: '00:12-00:15', size: '大远景拉出', camera: '垂直拉升', light: '收光至黑，仅剩片名亮起', sfx: '一声定音鼓 + 余韵混响' },
  ];

  const contents = [s.hook, s.entrance, s.conflict, s.climax, s.title];

  return meta.map((m, i) => ({
    shot: i + 1,
    timecode: m.tc,
    duration: '3秒',
    size: m.size,
    content: fill(contents[i]),
    camera: m.camera,
    light: m.light,
    sfx: m.sfx,
    aiPrompt:
      `${fill(contents[i])}，${m.size}，${m.camera}镜头，${m.light}，` +
      `电影感画面，15秒预告片第${i + 1}镜（时间码${m.tc}），画幅2.39:1`,
    aiPromptEn:
      `Cinematic shot ${i + 1}/5 for a 15s trailer: ${fill(contents[i])}, ` +
      `${m.size}, ${m.camera} camera, ${m.light}, anamorphic 2.39:1`,
  }));
}

/** 汇总导出文本（用于复制/导出） */
export function exportResultText(result) {
  const { character, meal, poster, storyboard, source } = result;
  const lines = [];
  lines.push(`麦门电影宇宙 · 专属电影档案`);
  lines.push(`=====================================`);
  lines.push(`人格：${character.personaName}（${character.personaEn}）`);
  lines.push(`匹配餐品：${meal.item.name}${source === 'live' ? '（来自麦当劳 MCP 实时数据）' : '【DEMO 模式：非实时数据】'}`);
  lines.push(`片名：${character.movieTitle}`);
  lines.push(`类型：${character.movieGenre}`);
  lines.push(`主角身份：${character.protagonistIdentity}`);
  lines.push(``);
  lines.push(`角色简介：${character.characterIntro}`);
  lines.push(`经典台词：${character.classicQuote}`);
  lines.push(`分享文案：${character.shareCopy}`);
  lines.push(``);
  lines.push(`--- 海报提示词（中文）---`);
  lines.push(poster.zh);
  lines.push(``);
  lines.push(`--- Poster Prompt (EN) ---`);
  lines.push(poster.en);
  lines.push(``);
  lines.push(`--- 15 秒预告片分镜 ---`);
  for (const s of storyboard) {
    lines.push(`【镜头${s.shot}】${s.timecode}｜${s.size}｜${s.content}`);
    lines.push(`  运镜：${s.camera}｜灯光：${s.light}｜音效：${s.sfx}`);
    lines.push(`  AI视频提示词：${s.aiPrompt}`);
  }
  lines.push(``);
  lines.push(`本内容为娱乐创作，非麦当劳官方出品；餐品信息以官方渠道为准。`);
  return lines.join('\n');
}
