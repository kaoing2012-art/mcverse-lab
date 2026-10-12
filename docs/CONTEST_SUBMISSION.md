# 参赛提交材料

> 2026 麦当劳程序员创意开发大赛 · 提交清单与报名 Issue 文案

## 一、官方要求对照

| 官方要求 | 本项目状态 |
|---|---|
| `README.md`（项目介绍/安装/示例/目标用户） | ✅ 已完成 |
| `CONTEST_DECLARATION.md`（文件名与内容不可改动） | ✅ 使用官方原文，未做任何修改 |
| `MCP_INTEGRATION.md`（MCP Server/Tool/流程/业务价值） | ✅ 已完成，含 2026-10-10 真实调用实测记录 |
| 源代码（可运行内容） | ✅ 零依赖 Node.js，**24 个单元测试全部通过** |
| `workbuddy.md`（WorkBuddy 专项奖励，非必须） | ✅ **已加入 WorkBuddy 原始会话导出**（第四节内嵌完整逐轮对话） |
| GitHub 仓库为 Public | ✅ **已发布**：https://github.com/kaoing2012-art/mcverse-lab |
| 项目创建时间 2025-12-25 之后 | ✅ 2026-10-10 创建 |
| 报名 Issue（正文 ≤1000 字，不带图片） | ✅ **已提交（#494），官方已确认成功参赛** |

## 二、报名 Issue（可直接复制）

**Issue 标题**（在官方仓库 New Issue 中填写）：

```
McVerse Lab 麦门电影宇宙 —— 4 题测出你的麦门电影人格，MCP 真实餐品生成专属电影
```

**Issue 正文**：

```
【参赛申请】
项目名称：McVerse Lab 麦门电影宇宙
项目地址：https://github.com/kaoing2012-art/mcverse-lab
项目简介：一个把「麦当劳真实餐品数据」变成「你的专属电影」的互动 Skill。用户回答 4 道趣味人格题，系统以确定性规则算出 6 种麦门电影人格之一，再通过麦当劳 MCP 查询真实餐品数据（list-nutrition-foods 餐品营养列表，实测 160 项），按人格标签匹配出本命餐品，生成电影角色档案、中英双语海报提示词（竖版 3:4，含负面提示词）和 15 秒预告片分镜（5 镜 × 3 秒，含时间码/景别/运镜/灯光/音效/AI 视频提示词）。项目为零依赖 Node.js 实现，同时提供 WorkBuddy Skill、命令行与暗色电影主题的移动端优先 HTML Demo；MCP 失败时自动降级并在结果中明确标注 DEMO 模式，不把演示数据说成实时数据。全链路采用只读白名单，名单外工具（下单/领券/抽奖等）在代码层被硬拦截，Token 全程脱敏且不入库。已通过单元测试（含 256 种答案组合全遍历、平分规则、白名单拦截、Token 脱敏、Demo 降级）。使用 WorkBuddy 开发。
```

> ⚠️ 正文约 500 字，符合 ≤1000 字要求；**请勿在 Issue 中附加图片**。
>
> 📌 **与已提交版本的差异说明**：线上报名 Issue #494 提交于早期版本，其中写的是
> 「查询真实在售餐品」。按现行措辞规则（`list-nutrition-foods` 只能称「真实餐品数据 / 餐品营养列表」，
> 不代表门店在售状态），本文件已更新为准确表述。**已提交的 Issue 不做修改**，
> 此处仅记录差异，供后续口头说明或新 Issue 时使用。

## 三、仓库 Description 与 Topics（复制粘贴即可）

**Description**（仓库右上角 ⚙️ → Description）：

```
麦门电影宇宙 —— 4 道题测出你的麦门电影人格，用麦当劳 MCP 真实餐品生成电影角色档案、中英双语海报提示词与 15 秒预告片分镜（零依赖 Node.js + WorkBuddy Skill + 移动端 HTML Demo）
```

**Topics**（同页 Topics 输入框，逐个回车添加）：

```
mcp
mcdonalds
workbuddy
agent-skill
ai-video
text-to-image
prompt-engineering
nodejs
```

> Topics 会影响 GitHub 搜索结果排序与「相关仓库」推荐，建议全部填上。

**Social Preview**（可选，提升分享卡片点击率）：
路径：仓库主页 → 仓库名下方标签栏最右侧 **Settings**（若标签被折叠，点 **⋯** 下拉里选 Settings）
→ 进入设置页后在 **General** 页里**往下滚**，找到 **Social preview** 区块 → 点 **Edit** → **Upload an image...**
→ 上传 1280×640 的图（官方要求：PNG/JPG/GIF 且 **< 1MB**，推荐 1280×640）
> 现成素材：`mcverse-lab-assets/social-preview-1280x640.png`（已按规格生成，84KB）
> 快速定位技巧：在设置页按 `Ctrl + F` 搜 `Social preview` 可直接跳到位。

## 四、提交前检查清单

- [x] GitHub 仓库已设为 **Public**
- [x] 仓库内包含 `CONTEST_DECLARATION.md`（内容与官方一致，未改动）
- [x] `workbuddy.md` 已加入 WorkBuddy 原始会话导出（逐轮对话上下文，凭证已脱敏）
- [x] 仓库内无任何真实 Token（可执行 `node scripts/security-scan.mjs` 自检）
- [x] 报名 Issue 已按格式提交（#494，官方已确认成功参赛），正文不含图片

## 五、发布后动作

1. 把仓库地址回填到 `README.md` 中 Star 引导链接（`public/index.html` 的 `#star-link` 同样需要）
2. ~~在报名的 Issue 里等待官方回复成功通知~~ ✅ 已完成：Issue #494 官方已确认成功参赛
3. 拉 Star：把 Demo 截图 + 一句话说明发到社交媒体（Star 数决定排行榜名次，10-25 23:59 截止）
