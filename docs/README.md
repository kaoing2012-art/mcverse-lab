# docs

项目文档与展示素材目录。

- 项目全貌与快速开始见根目录 [README.md](../README.md)
- MCP 接入与调用流程见 [MCP_INTEGRATION.md](../MCP_INTEGRATION.md)
- 参赛提交清单与报名 Issue 文案见 [CONTEST_SUBMISSION.md](./CONTEST_SUBMISSION.md)
- 示例输出见 [examples/](../examples)

## 展示素材（README 引用）

| 文件 | 内容 |
|---|---|
| `01-hero.png` | 首页（含海报氛围墙） |
| `03-result-full.jpg` | 完整结果页长图：人格卡 / AI 海报 / 电影档案 / 提示词 / 5 镜分镜 |
| `04-card-p1.png` | 人格结果卡 · 天生主角型（真实 MCP 数据） |
| `05-card-p2.png` | 人格结果卡 · 热血冒险型（真实 MCP 数据） |
| `06-card-p3.png` | 人格结果卡 · 温柔治愈型（真实 MCP 数据） |
| `07-mobile.png` | 手机宽度下的完整结果页 |
| `../public/posters/p1~p6.jpg` | 六个人格的 AI 示例海报（README 海报画廊引用） |

> 完整档案长图（2088px）体积较大，未入库；需要时用 `preview/p1-result.html` 直接截图获取。

### 素材是怎么生成的（可复现）

`preview/` 下的 HTML 由 `scripts/build-previews.mjs` 生成：调用本地服务取**真实 MCP 数据**，
套用与线上一致的 `public/style.css` 渲染成静态页，再截图导出 PNG。

```bash
npm start                                    # 先启动本地服务
node scripts/build-previews.mjs              # 生成 docs/preview/*.html
# 然后用浏览器打开 docs/preview/*.html 截图保存为上面的 PNG
```

> 说明：截图只反映**界面样式与真实返回内容**，未做任何美化修饰；
> 若数据随时间变化，重新执行上述命令即可刷新。
