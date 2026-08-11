# CLAUDE.md

## 项目概述

**安万嘉烟花展厅** — 烟花爆竹智慧零售与风险监测一体化系统。

- **前端**：Vue 3 + Vite + TypeScript + Element Plus + Pinia + Vue Router 5
- **后端**：Express 4 + Prisma ORM + SQLite（开发）/ PostgreSQL（生产） + JWT + Socket.IO + MQTT
- **部署**：Docker Compose（Nginx + Node + PostgreSQL + EMQX + 自动备份）

三条产品线：
1. **顾客端 H5** — 扫码浏览产品、下单、到店自提、安全告知电子签名
2. **企业管理后台** — 进销存、流向登记（AQ 4102）、视频监控、预警处理、数据报表
3. **政府监管端** — 实时地图、一企一档台账、预警督查、移动执法巡查

## 项目结构

```
fireworks-showroom/
├── src/                         # 前端源码（Vue 3 SPA）
│   ├── api/                     # Axios 封装 + 接口模块 (request/auth/product/order/store/alert/report)
│   ├── assets/styles/           # 全局样式
│   ├── components/              # 共享组件 (ProductCard, CartFloat, SignaturePad, monitoring/*)
│   ├── data/                    # 静态数据
│   ├── layouts/                 # 布局: DefaultLayout(顾客), AdminLayout(管理), GovLayout(政府)
│   ├── router/index.ts          # 路由: / (顾客), /admin (管理), /gov (政府), /login, /register
│   ├── stores/                  # Pinia: auth, cart, alert, app
│   ├── types/                   # TS 类型: alert, order, product, store, user
│   ├── views/                   # 页面组件
│   │   ├── admin/               # Dashboard, ProductManage, Inventory, OrderManage, FlowRegister, Monitor, AlertManage, Report
│   │   └── gov/                 # GovMap, StoreList, StoreLedger, GovAlerts, GovDashboard, MobileInspect
│   ├── App.vue
│   └── main.ts                  # 入口: createApp → Pinia → Router → ElementPlus → mount
├── server/                      # 后端源码（Express + Prisma）
│   ├── prisma/
│   │   ├── schema.prisma        # 数据模型 (User/Store/Product/Order/Alert/Camera/Device 等 18 张表)
│   │   └── seed.ts              # 种子数据
│   ├── src/
│   │   ├── config/              # 环境变量 + 文件上传配置
│   │   ├── controllers/         # 路由处理器 (10 个模块)
│   │   ├── middleware/          # auth (JWT+RBAC), errorHandler, validate (Zod)
│   │   ├── routes/              # 15 个路由模块 (/api/*)
│   │   ├── services/            # 业务逻辑: riskDetection, socketManager, mqtt, scheduler, rules/engine
│   │   ├── types/               # Express 类型扩展
│   │   ├── utils/               # jwt, password (bcrypt), logger (Winston), audit
│   │   ├── app.ts               # Express 应用配置 (helmet, cors, morgan, routes, errorHandler)
│   │   └── index.ts             # 服务器入口: Prisma连接 → Socket.IO → MQTT → Scheduler → 监听3000
│   ├── uploads/                 # 上传文件 (multer)
│   ├── Dockerfile
│   ├── docker-compose.yml       # backend + PostgreSQL + EMQX + Nginx + db-backup
│   └── nginx.conf
├── docs/
│   └── PROPOSAL.md              # 完整技术方案 v2.0
├── public/                      # 静态资源 (favicon, logo, videos)
├── dist/                        # Vite 构建产物
├── index.html                   # HTML 入口
├── vite.config.ts               # Vite 配置: @别名, 5173端口, /api → localhost:3000 代理
├── package.json                 # 前端依赖
└── tsconfig.json
```

## 常用命令

### 前端（根目录）

```bash
npm install              # 安装依赖
npm run dev              # 启动前端开发服务器 (localhost:5173)
npm run build            # 类型检查 + 构建
npm run preview          # 预览构建产物
npm run lint             # ESLint + Oxlint
npm run format           # Prettier 格式化
```

### 后端（server/ 目录）

```bash
cd server
npm install              # 安装后端依赖
npm run dev              # 启动后端开发服务器 (localhost:3000, tsx watch 热重载)
npm run build            # tsc 编译
npm run db:generate      # 生成 Prisma Client
npm run db:migrate       # 数据库迁移
npm run db:seed          # 填充种子数据
```

### 开发环境一键启动

```bash
# 终端1: 后端
cd server && npm run dev

# 终端2: 前端
npm run dev
# 前端访问 http://localhost:5173，API 请求自动代理到 :3000
```

### Docker 生产部署

```bash
cd server
cp .env.example .env     # 编辑 .env 填入实际配置
docker compose up -d     # 启动全部服务
```

## 技术架构要点

### 前端架构

- **UI 框架**：Element Plus（管理后台/政府端），顾客端为自建移动端组件
- **状态管理**：Pinia stores — `auth`（用户认证）、`cart`（购物车）、`alert`（WebSocket 实时预警）、`app`（全局 UI）
- **路由守卫**：`router.beforeEach` 检查 JWT token 存在性 + 角色权限匹配（解析 token payload 中的 role 字段）
- **HTTP 拦截器**：`src/api/request.ts` — 自动附加 Bearer token，401 时自动 refresh token（带请求队列防并发刷新）
- **API 代理**：Vite dev server 将 `/api/*` 代理到 `http://localhost:3000`

### 后端架构

- **认证**：双 Token 机制 — accessToken（JWT）、refreshToken（7天/30天），bcryptjs 加密密码
- **权限**：RBAC 6 角色 — SUPER_ADMIN / GOV_INSPECTOR / ENTERPRISE_ADMIN / STORE_MANAGER / CLERK / CUSTOMER
- **实时推送**：Socket.IO，按门店房间（per-store rooms）推送预警
- **风险检测**：8 大场景（超量存放/人员聚集/吸烟/超范围经营/店外违规/店外试放/温湿度异常/烟雾火情）
- **预警规则引擎**：`services/rules/engine.ts` — 可配置规则（metric/operator/threshold）、分级（黄/橙/红）、冷却窗口、升级机制
- **定时任务**：`services/scheduler.ts` — node-cron 执行定期检查和告警升级
- **IoT 集成**：MQTT 协议（EMQX broker），支持温湿度/烟雾/红外计数/继电器设备
- **文件上传**：Multer，限制 10MB，存储于 `server/uploads/`
- **日志**：Winston，非生产环境使用 morgan dev 格式
- **验证**：Zod schema 校验所有入参

### 数据库

- **开发**：SQLite（`server/prisma/dev.db`）
- **生产**：PostgreSQL 16
- **ORM**：Prisma，18 张数据表（含 6 大枚举类型）
- 核心关系：User → Store（多对一），Product → Category（多对一），Inventory（Store↔Product 多对多），Order → OrderItem，Alert → Store，Device → DeviceReading

### 关键合规标准

- GB 10631—2025（烟花爆竹安全与质量）
- AQ 4101—2026（风险监测预警技术规范）
- AQ 4102—2026（流向登记通用规范）

## 开发约定

- **TypeScript strict**：前后端均使用 TypeScript，前端 `.vue` 文件使用 `<script setup lang="ts">`
- **路径别名**：前端 `@/` → `src/`，后端使用 `.js` 扩展名导入（ESM 兼容）
- **样式**：Element Plus 组件 + 项目 scoped 样式，格式化使用 Prettier
- **Lint**：ESLint + Oxlint 双重检查，提交前运行 `npm run lint`
- **API 响应格式**：`{ code: number, message: string, data: T }` — 通过 `res.json()` 返回
- **路由命名**：页面使用 PascalCase（如 `ProductManage`），路由路径使用 kebab-case（如 `/product/:id`）
- **后端文件命名**：controllers 按领域划分（`*.controller.ts`），routes 对应（`*.routes.ts`），services 独立文件
- **环境变量**：后端 `.env` 文件，前端 `VITE_*` 前缀变量通过 `import.meta.env` 访问
- **种子用户**：admin / 123456（超级管理员）
