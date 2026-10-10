# MCP_INTEGRATION.md —— 麦当劳 MCP 接入与调用说明

本文档说明 McVerse Lab 实际使用的麦当劳 MCP Server、Tool、调用流程与业务价值。

## 1. 接入信息

| 项目 | 值 |
|---|---|
| MCP Server | 麦当劳中国官方 MCP（[官方接入指南](https://github.com/M-China/mcd-mcp-server)） |
| 端点 | `https://mcp.mcd.cn` |
| 传输协议 | Streamable HTTP（JSON-RPC 2.0 over HTTP POST） |
| 鉴权 | 请求头 `Authorization: Bearer <MCP Token>` |
| Token 申请 | [open.mcd.cn/mcp](https://open.mcd.cn/mcp) → 手机号登录 → 控制台 → 激活 |
| 限流 | 600 次/分钟（超限返回 429） |
| 错误码 | 401 = Token 无效/过期/未提供；429 = 触发限流 |

本项目的客户端实现位于 `src/mcp-client.js`（零依赖）：
`initialize`（捕获 `mcp-session-id`）→ `notifications/initialized` → `tools/list` → `tools/call`。
响应兼容 `application/json` 与 `text/event-stream` 两种格式。

## 2. 实际使用的工具（全部为只读查询）

| 工具 | 用途 | 调用条件 |
|---|---|---|
| `list-nutrition-foods` | 餐品营养信息列表（无需定位，全国通用） | 默认路径 |
| `query-nearby-stores` | 查询定位附近门店 | 用户提供 `--location` 时 |
| `query-meals` | 查询当前门店可售卖餐品菜单（分类/编码/标签） | 拿到门店 ID 后 |
| `query-meal-detail` | 查询餐品详情/套餐组成 | 预留（结果展示增强） |

### 调用流程

```
工具发现 tools/list
   ├─ 有定位且工具可用：
   │    query-nearby-stores(address) → 提取 storeId
   │      → query-meals(storeId) → 门店真实菜单 ─┐
   ├─ 无定位 / 工具缺失：                         ├→ 归一化 → 人格匹配
   │    list-nutrition-foods() → 餐品表 ─────────┘
   └─ 全部失败 → DEMO 模式（本地 demo-menu.json，输出明确标注非实时）
```

单次完整请求最多调用 3 个工具（tools/list + 2 个查询），远低于限流阈值。

## 3. 响应处理

官方工具响应字段可能随版本调整，`src/matching.js` 的 `normalizeMcpItems()`
做防御式解析：兼容 `data.list` / `result` / 直接数组等常见结构，
餐品名依次尝试 `name / foodName / food_name / productName / title` 等常见字段。
解析失败不抛错，降级为 warning 并进入 DEMO 模式，保证流程不中断。

## 4. 安全与合规

### 写操作硬拦截
`src/mcp-client.js` 维护写操作黑名单（`WRITE_TOOLS`）：
`create-order`、`cancel-order`、`auto-bind-coupons`、`draw-lottery`、
`mall-create-order`、`party-order-create`、`delivery-create-address`。
`callTool()` 对黑名单工具直接抛错，**不发起任何网络请求**（有单元测试覆盖）。
本项目全链路不涉及下单、支付、领券等任何资金/权益操作。

### Token 安全
- Token 读取优先级：显式参数 > 环境变量 `MCD_MCP_TOKEN` > `~/.config/mcd/mcp_token`
- Token 只存在于服务端进程；HTML Demo 的所有 MCP 调用由 `src/server.js` 服务端执行，
  浏览器只与本地 API 通信，**永远接触不到 Token**
- 所有日志与错误信息经 `redact()` 脱敏为 `Bearer ***`（有单元测试覆盖）
- 仓库内只有 `YOUR_MCP_TOKEN` 占位符（`.env.example` / `mcp-config.example.json`）

### 调试信息
`runPipeline()` 返回的 `debug` 字段记录 `toolsCalled`（工具调用序列）、
时间戳与失败原因（已脱敏），便于排查；不包含 Token 与个人数据。

## 5. 业务价值

麦当劳 MCP 在本项目中扮演「真实世界的连接器」：人格测试的结论只有落到
一份**真实存在、当前可点**的餐品上，电影角色才可信、可传播。
相比内置一份静态菜单，MCP 让内容与真实供给保持一致——这也是「麦门电影宇宙」
区别于普通趣味测试的核心：**你的电影主角，是今天真的能吃到的那一口。**

## 6. 实测记录

### 2026-10-10 真实数据验证（已通过）

- ✅ `initialize` + `tools/list`：发现 **35 个工具**，本项目依赖的 5 个只读工具全部存在
- ✅ `list-nutrition-foods`：返回 **160 个真实餐品**（含热量字段）
- ✅ 响应格式实测：`content[0].text` 为 markdown 包裹的 JSON，
  其中 `data` 为表格字符串 `[N]{productName,...}:\n  名称,数值,...`，
  解析器 `parseTabularData()` 已适配（`src/matching.js`，有单元测试覆盖）
- ✅ 六人格真实匹配结果：

| 人格 | 真实餐品 Top1 | 匹配分 |
|---|---|---|
| 天生主角型 | 芝士双层安格斯厚牛堡 | 6 |
| 热血冒险型 | 麦辣鸡翅-2块 | 6 |
| 温柔治愈型 | 圆筒冰淇淋 | 4 |
| 冷静智谋型 | 浓缩咖啡 | 4 |
| 快乐社交型 | 麦乐鸡5块 | 2 |
| 自由浪漫型 | 麦旋酷阳光橙 | 4 |

- ✅ Web Demo 全链路（`POST /api/quiz` → `source: "live"`）验证通过，
  真实输出示例见 `examples/sample-output-live.txt`
- 验证脚本：`node tests/live-mcp-check.mjs`（需先配置 Token）

### 未验证项

- `query-nearby-stores → query-meals` 门店菜单路径：需要真实定位信息，
  代码路径与归一化已就绪，字段结构以官方文档为准做了防御式解析
  （响应结构与 list-nutrition-foods 同为 markdown 包裹 JSON 时可正常解析）
