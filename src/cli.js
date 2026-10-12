/**
 * McVerse Lab —— 命令行入口
 *
 * 用法：
 *   node src/cli.js                      # 交互式问答（无 TTY 时使用默认答案）
 *   node src/cli.js --answers 0,1,2,0    # 直接指定四题选项
 *   node src/cli.js --location 上海市    # 可选：按定位尝试查询当前门店菜单（失败则回退餐品营养列表）
 *
 * 输出完整电影档案 JSON + 文本到 stdout。
 */

import { runPipeline, exportResultText } from './pipeline.js';

const args = process.argv.slice(2);
function argOf(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}

let answers;
if (argOf('--answers')) {
  answers = argOf('--answers').split(',').map((n) => parseInt(n, 10));
} else {
  answers = [0, 1, 2, 0]; // 默认演示答案
  console.error('(未指定 --answers，使用默认演示答案 0,1,2,0)');
}

const location = argOf('--location') || undefined;

try {
  const result = await runPipeline(answers, { location });
  result.exportedText = exportResultText(result);
  console.log(result.exportedText);
  console.error('\n--- debug ---');
  console.error(JSON.stringify({ source: result.source, toolsCalled: result.debug.toolsCalled, mcpError: result.debug.mcpError }, null, 2));
} catch (err) {
  console.error(`执行失败: ${err.message}`);
  process.exit(1);
}
