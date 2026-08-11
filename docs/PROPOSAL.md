# 烟花爆竹智慧零售与风险监测一体化系统建设方案

> **技术方案 v2.0** | 基于 GB 10631—2025、AQ 4101—2026、AQ 4102—2026、AQ 4127—2026

---

## 一、项目概述

本方案将 **"烟花爆竹自助购买与展示系统"** 与 **"风险监测预警系统"** 整合为一套完整的技术解决方案，核心逻辑为 **"零售店即仓库"** ——将零售门店视作小型仓储单元，同时实现顾客自助浏览购买与店内安全环境实时监测的双重目标。

### 核心价值主张

> **顾客看了再买、老板卖了放心、监管查了无忧**

### 系统组成

```
┌──────────────────────────────────────────────────────────────────┐
│                    烟花爆竹智慧零售与风险监测一体化平台              │
├────────────┬──────────────┬──────────────────┬──────────────────┤
│  顾客端H5   │  企业管理后台  │  风险监测预警子系统  │   政府监管端     │
│ (小程序/H5) │  (Web管理端)  │   (AI+IoT规则引擎)  │  (Web监管大屏)   │
├────────────┼──────────────┼──────────────────┼──────────────────┤
│· 扫码看产品  │· 进销存管理   │· 8大场景智能识别    │· 实时地图总览    │
│· 产品详情   │· 流向登记     │· 分级预警推送      │· 一企一档台账    │
│· 在线下单   │· 视频监控     │· 整改闭环管理      │· 预警分级管理    │
│· 到店自提   │· 预警接收     │· WebSocket实时通知 │· 数据分析画像    │
│· 安全告知   │· 数据报表     │· UPS断电保障      │· 移动执法巡查    │
└────────────┴──────────────┴──────────────────┴──────────────────┘
```

### 用户角色矩阵

| 角色 | 权限范围 | 核心功能 |
|------|---------|---------|
| **顾客 (Customer)** | 指定门店 | 扫码浏览产品、下单、安全签名、到店核销 |
| **店员 (Clerk)** | 所属门店 | 核销订单、查看库存、基础操作 |
| **店长 (Store Manager)** | 所属门店 | 进销存管理、流向登记、预警处理、查看监控 |
| **企业管理员 (Enterprise Admin)** | 所有门店 | 全部管理功能 + 数据分析 + 系统配置 |
| **政府监管员 (Gov Inspector)** | 辖区全部 | 地图监控、一企一档、预警督查、移动执法 |
| **超级管理员 (Super Admin)** | 全系统 | 用户管理、系统配置、审计日志 |

---

## 二、技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Layer (Browser)                     │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ Customer H5  │  │  Admin Dashboard  │  │   Gov Platform   │       │
│  │ (Vant UI)    │  │  (Element Plus)   │  │ (Element + Map)  │       │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬─────────┘       │
│         │                   │                      │                 │
│         └───────────────────┼──────────────────────┘                 │
│                             │ HTTP/HTTPS + WebSocket                 │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────────┐
│                     API Gateway Layer (Express)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Auth     │  │ Rate     │  │ CORS     │  │ Validate │            │
│  │ Middleware│  │ Limiter  │  │          │  │ (Zod)    │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────────┐
│                       Service Layer                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ Product  │  │ Order    │  │ Inventory│  │ FlowRegistration │    │
│  │ Service  │  │ Service  │  │ Service  │  │ Service (AQ4102) │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ Alert    │  │ Report   │  │ Camera   │  │ RiskDetection    │    │
│  │ Service  │  │ Service  │  │ Service   │  │ Service (8场景)   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘    │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              Socket Manager (WebSocket Rooms)                 │    │
│  │           per-store rooms for real-time alert push            │    │
│  └──────────────────────────────────────────────────────────────┘    │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────────┐
│                         Data Layer (Prisma ORM)                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                  SQLite (dev) / MySQL (prod)                  │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈详情

#### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5+ | 前端框架，Composition API + `<script setup>` |
| TypeScript | 5.7+ | 类型安全 |
| Vite | 8.x | 构建工具 |
| Vue Router | 5.x | 路由管理 |
| Pinia | 3.x | 状态管理 |
| Element Plus | 2.x | 管理后台/Gov端UI组件库 |
| Vant | 4.x | 顾客移动端UI组件库 |
| ECharts | 5.x | 数据图表 |
| Axios | 1.x | HTTP客户端 |
| Socket.IO Client | 4.x | WebSocket实时通信 |
| Day.js | 1.x | 日期处理 |

#### 后端技术栈

| 技术 | 用途 |
|------|------|
| Node.js 22+ | 运行时 |
| Express 4.x | Web框架 |
| TypeScript + tsx | 类型安全 + 热重载 |
| Prisma ORM | 数据库ORM |
| JWT (jsonwebtoken + bcryptjs) | 认证 |
| Socket.IO | 实时推送 |
| Multer | 文件上传 |
| Zod | 请求验证 |
| Winston | 日志 |
| node-cron | 定时任务 |

### 2.3 部署架构

```
┌──────────────────────────────────────────────────────┐
│                    Nginx / Caddy                      │
│         Reverse Proxy + Static Files + SSL            │
├──────────────────┬───────────────────────────────────┤
│   /api/*         │   /*                               │
│   → Node:3000    │   → /client/dist/ (SPA)            │
└──────────────────┴───────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│              PM2 Cluster (Node.js)                    │
│  ┌────────────────┐  ┌────────────────┐              │
│  │  Express App   │  │  Socket.IO     │              │
│  │  (REST API)    │  │  (WebSocket)   │              │
│  └────────┬───────┘  └────────┬───────┘              │
│           └───────────────────┘                       │
│                    │                                  │
└────────────────────┼──────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│           MySQL / SQLite Database                     │
└──────────────────────────────────────────────────────┘
```

---

## 三、数据库设计

### 3.1 ER图

```
                    ┌──────────────┐
                    │   Category   │
                    │  id, name    │
                    └──────┬───────┘
                           │ 1:N
                           ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ ProductStore │◄───│   Product    │    │  SafetyAgree │
│ productId    │    │  id, name    │    │  userId      │
│ storeId      │    │  price       │    │  orderId     │
│ price        │    │  categoryId  │    │  signature   │
└──────┬───────┘    │  safetyLevel │    └──────────────┘
       │            │  powderQty   │
       │ N:1        │  standards   │
       ▼            └──────┬───────┘
┌──────────────┐           │
│    Store     │◄──────────┼────────────────────────────┐
│  id, name    │           │                            │
│  code (许可) │           │                            │
│  address     │           │                            │
│  lat, lng    │           │                            │
│  status      │           │                            │
│  capacity    │           │                            │
└──────┬───────┘           │                            │
       │                   │                            │
       │ 1:N               │ 1:N                        │ 1:N
       ▼                   ▼                            ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    User      │    │  Inventory   │    │   Camera     │
│  id, username│    │  storeId     │    │  storeId     │
│  password    │    │  productId   │    │  name        │
│  role (枚举) │    │  quantity    │    │  rtspUrl     │
│  storeId     │    └──────────────┘    │  status      │
└──────┬───────┘                        └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐    ┌──────────────┐
│    Order     │    │   FlowReg    │
│  orderNo     │    │  type (枚举)  │
│  customerName│    │  productId   │
│  totalAmount │    │  quantity    │
│  status      │    │  batchNo     │
│  pickupCode  │    │  operatorId  │
│  signedSafety│    │  storeId     │
└──────┬───────┘    └──────────────┘
       │ 1:N
       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  OrderItem   │    │    Alert     │    │  Inspection  │
│  orderId     │    │  storeId     │    │  storeId     │
│  productId   │    │  type (枚举)  │    │  inspectorId │
│  quantity    │    │  level (枚举) │    │  result      │
│  price       │    │  status      │    │  score       │
└──────────────┘    │  handledBy   │    │  photos      │
                    └──────────────┘    └──────────────┘
```

### 3.2 核心表说明

#### 业务表

| 表名 | 关键字段 | 说明 |
|------|---------|------|
| `User` | id, username, password(加密), realName, phone, role, storeId | 用户认证+RABC |
| `Store` | id, name, code(许可证号), address, lat, lng, status, capacity, contact, phone | 零售门店 |
| `Category` | id, name | 产品分类（组合烟花/喷花类/旋转类/吐珠类等） |
| `Product` | id, name, price, categoryId, safetyLevel(C/D), powderQuantity, safetyDistance, standards, description, isKidFriendly, isOnSale, effectVideoUrl, appearanceVideoUrl | 产品目录 |
| `ProductStore` | productId, storeId, price | 门店-产品关联（支持门店独立定价） |
| `Inventory` | id, storeId, productId, quantity | 实时库存 |
| `Order` | id, orderNo, customerName, customerPhone, storeId, totalAmount, status, pickupCode, signedSafety | 顾客订单 |
| `OrderItem` | id, orderId, productId, quantity, price | 订单明细 |
| `FlowReg` | id, storeId, type(PURCHASE/SALE/RETURN/DESTROY), productId, quantity, batchNo, supplier, operatorId | AQ 4102流向登记 |
| `SafetyAgreement` | id, userId, orderId, signatureImage, agreedAt | 安全告知电子签名 |

#### 安全监控表

| 表名 | 关键字段 | 说明 |
|------|---------|------|
| `Camera` | id, storeId, name, rtspUrl, status | 门店摄像头 |
| `Alert` | id, storeId, type, level(YELLOW/ORANGE/RED), title, description, imageUrl, status, handledBy, rectifiedAt | 风险预警 |
| `Inspection` | id, storeId, inspectorId, result(PASS/FAIL/RECTIFY), score, photos, remark | 政府执法巡查 |
| `AuditLog` | id, userId, action, entity, entityId, detail, createdAt | 审计日志 |

### 3.3 枚举定义

```typescript
// 用户角色
enum Role { SUPER_ADMIN, GOV_INSPECTOR, ENTERPRISE_ADMIN, STORE_MANAGER, CLERK }

// 门店状态
enum StoreStatus { NORMAL, CAUTION, DANGER }  // 绿/黄/红

// 预警类型（8大场景）
enum AlertType {
  OVERSTOCK,           // 超量存放
  CROWD_GATHERING,     // 人员聚集
  SMOKING,             // 吸烟/点火
  OUT_OF_SCOPE_SALES,  // 超范围经营
  OUTDOOR_ILLEGAL,     // 店外违规摆放
  OUTDOOR_TEST_FIRE,   // 店外点火/试放
  TEMP_HUMIDITY_ANOMALY, // 温湿度超标
  SMOKE_FIRE            // 烟雾/火情
}

// 预警等级
enum AlertLevel { YELLOW, ORANGE, RED }

// 预警状态
enum AlertStatus { NEW, ACKNOWLEDGED, HANDLING, RESOLVED }

// 流向类型
enum FlowType { PURCHASE, SALE, RETURN, DESTROY }

// 订单状态
enum OrderStatus { PENDING, PAID, READY, PICKED_UP, CANCELLED }
```

---

## 四、API接口设计

### 4.1 接口总览

| 模块 | 路由前缀 | 接口数 | 说明 |
|------|---------|--------|------|
| 认证 | `/api/auth` | 5 | 注册、登录、刷新Token、个人信息 |
| 产品 | `/api/products` | 6 | CRUD + 分类 |
| 门店 | `/api/stores` | 4 | 列表、详情、状态查询 |
| 库存 | `/api/inventory` | 3 | 查询、批量更新、阈值告警 |
| 订单 | `/api/orders` | 6 | 下单、支付、安全签名、状态管理 |
| 流向登记 | `/api/flow` | 3 | AQ 4102合规流向管理 |
| 预警 | `/api/alerts` | 5 | 列表、详情、状态更新、整改上传、统计 |
| 摄像头 | `/api/cameras` | 4 | CRUD |
| 巡查 | `/api/inspections` | 4 | 创建、查询、历史 |
| 报表 | `/api/reports` | 4 | 销售、库存、预警、合规 |

### 4.2 核心接口详情

#### 认证 `/api/auth`

```
POST /api/auth/register     # 注册 { username, password, realName, phone }
POST /api/auth/login        # 登录 { username, password } → { accessToken, refreshToken, user }
POST /api/auth/refresh      # 刷新Token { refreshToken } → { accessToken }
GET  /api/auth/me           # [需认证] 当前用户信息
PUT  /api/auth/me           # [需认证] 更新个人信息
```

#### 产品 `/api/products`

```
GET    /api/products             # 产品列表 [?categoryId=&search=&storeId=&page=&limit=]
GET    /api/products/:id         # 产品详情（含安全参数）
POST   /api/products             # [需Admin] 创建产品
PUT    /api/products/:id         # [需Admin] 更新产品
DELETE /api/products/:id         # [需Admin] 软删除产品
GET    /api/products/categories  # 分类列表
```

#### 订单 `/api/orders`

```
POST /api/orders                  # [需认证] 创建订单 { storeId, items, customerName, phone }
GET  /api/orders                  # [需认证] 订单列表（顾客看自己的，店员看门店的）
GET  /api/orders/:id              # [需认证] 订单详情（含核销码）
PUT  /api/orders/:id/status       # [需Admin] 更新状态 { status }
POST /api/orders/:id/pay          # [需认证] 模拟支付
POST /api/orders/:id/sign-safety  # [需认证] 提交安全签名 { signatureImage }
```

#### 流向登记 `/api/flow`

```
GET  /api/flow                    # [需Admin] 流向记录列表 [?type=&storeId=&startDate=&endDate=&page=]
POST /api/flow                    # [需Admin] 创建流向记录（自动更新库存）{ type, productId, quantity, batchNo, supplier }
GET  /api/flow/report             # [需Admin] 流向汇总报表
```

#### 预警 `/api/alerts`

```
GET  /api/alerts                  # [需认证] 预警列表 [?type=&level=&status=&storeId=&page=]
GET  /api/alerts/:id              # [需认证] 预警详情
PUT  /api/alerts/:id/status       # [需Admin] 更新处理状态 { status }
POST /api/alerts/:id/upload-proof # [需Admin] 上传整改凭证 (multipart)
GET  /api/alerts/stats            # [需认证] 预警统计
```

---

## 五、项目目录结构

```
fireworks-showroom/
├── src/                            # 前端源码
│   ├── api/                        # Axios封装 + 接口模块
│   │   ├── request.ts              # Axios实例（拦截器、Token刷新）
│   │   ├── auth.ts                 # 认证API
│   │   ├── product.ts              # 产品API
│   │   ├── order.ts                # 订单API
│   │   ├── store.ts                # 门店API
│   │   ├── alert.ts                # 预警API
│   │   └── report.ts               # 报表API
│   ├── assets/styles/              # 全局样式
│   ├── components/                 # 共享组件
│   │   ├── ProductCard.vue         # 产品卡片
│   │   ├── CartFloat.vue           # 购物车浮窗
│   │   ├── SafetyNotice.vue        # 安全须知组件
│   │   ├── SignaturePad.vue        # 电子签名板
│   │   ├── VideoPlayer.vue         # 视频播放器
│   │   ├── PickupCodeDisplay.vue   # 核销码展示
│   │   └── monitoring/             # 监控相关组件
│   │       ├── CameraStream.vue    # 单路摄像头播放器
│   │       ├── CameraGrid.vue      # 2×2摄像头网格
│   │       ├── AlertBadge.vue      # 预警徽标
│   │       ├── AlertNotification.vue # 实时预警弹窗
│   │       └── HistoryTimeline.vue # 预警时间线
│   ├── layouts/                    # 布局组件
│   │   ├── DefaultLayout.vue       # 顾客端布局（Header + Tabbar）
│   │   ├── AdminLayout.vue         # 管理后台布局（Sidebar + Header）
│   │   └── GovLayout.vue           # 政府端布局
│   ├── router/index.ts             # 路由定义
│   ├── stores/                     # Pinia状态管理
│   │   ├── cart.ts                 # 购物车（已有，需扩展）
│   │   ├── auth.ts                 # 认证状态
│   │   ├── alert.ts                # 预警状态（WebSocket）
│   │   └── app.ts                  # 全局UI状态
│   ├── types/                      # TypeScript类型定义
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── user.ts
│   │   ├── alert.ts
│   │   └── store.ts
│   ├── utils/                      # 工具函数
│   │   ├── constants.ts            # 常量
│   │   └── format.ts               # 格式化（价格、日期）
│   ├── views/                      # 页面组件
│   │   ├── HomeView.vue            # 首页（已有，需重构）
│   │   ├── ProductDetail.vue       # 产品详情
│   │   ├── CartView.vue            # 购物车页
│   │   ├── CheckoutView.vue        # 结算页（安全签名）
│   │   ├── OrderDetail.vue         # 订单详情（核销码）
│   │   ├── LoginView.vue           # 登录
│   │   ├── RegisterView.vue        # 注册
│   │   ├── AboutView.vue           # 关于
│   │   ├── admin/                  # 管理后台页面
│   │   │   ├── DashboardView.vue   # 仪表盘
│   │   │   ├── ProductManage.vue   # 产品管理
│   │   │   ├── InventoryView.vue   # 库存管理
│   │   │   ├── OrderManage.vue     # 订单管理
│   │   │   ├── FlowRegister.vue    # 流向登记（AQ 4102）
│   │   │   ├── MonitorView.vue     # 视频监控
│   │   │   ├── AlertManage.vue     # 预警管理
│   │   │   └── ReportView.vue      # 数据报表
│   │   └── gov/                    # 政府监管页面
│   │       ├── GovMapView.vue      # 实时地图
│   │       ├── StoreList.vue       # 门店列表
│   │       ├── StoreLedger.vue     # 一企一档
│   │       ├── GovAlertList.vue    # 预警管理
│   │       ├── GovDashboard.vue    # 数据分析
│   │       └── MobileInspect.vue   # 移动执法
│   ├── App.vue                     # 根组件（<router-view>）
│   └── main.ts                     # 入口
├── server/                         # 后端源码
│   ├── prisma/
│   │   ├── schema.prisma           # 数据库Schema
│   │   └── seed.ts                 # 种子数据
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts            # 环境变量配置
│   │   │   └── upload.ts           # Multer文件上传配置
│   │   ├── controllers/            # 路由处理器
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT认证 + RABC
│   │   │   ├── errorHandler.ts     # 全局错误处理
│   │   │   └── validate.ts         # Zod请求验证
│   │   ├── routes/                 # 路由定义
│   │   ├── services/               # 业务逻辑层
│   │   │   ├── riskDetection.ts    # 8大场景检测引擎
│   │   │   ├── socketManager.ts    # WebSocket房间管理
│   │   │   └── cameraStub.ts       # 摄像头模拟（开发用）
│   │   ├── types/                  # 类型定义
│   │   ├── utils/
│   │   │   ├── jwt.ts              # JWT工具
│   │   │   ├── password.ts         # 密码加密
│   │   │   ├── logger.ts           # Winston日志
│   │   │   └── audit.ts            # 审计日志
│   │   ├── app.ts                  # Express应用配置
│   │   └── index.ts                # 服务器入口
│   ├── uploads/                    # 上传文件存储
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── docs/
│   ├── PROPOSAL.md                 # 本方案文档
│   └── API.md                      # API参考文档
├── public/                         # 静态资源
│   ├── favicon.ico
│   ├── logo.jpg
│   └── videos/                     # 产品视频
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .gitignore
```

---

## 六、安全设计

### 6.1 认证机制

- **双Token机制**：accessToken（15min有效期）+ refreshToken（7天有效期）
- **密码加密**：bcryptjs，salt rounds = 12
- **Token刷新**：accessToken过期时，客户端自动用refreshToken换取新token

### 6.2 权限控制（RBAC）

| 角色 | 顾客端 | 管理后台 | 政府端 |
|------|--------|---------|--------|
| Customer | ✅ | ❌ | ❌ |
| Clerk | ✅ | 基础（订单核销、库存查看） | ❌ |
| Store Manager | ✅ | 门店全功能 | ❌ |
| Enterprise Admin | ✅ | 全部门店功能 | ❌ |
| Gov Inspector | ❌ | ❌ | ✅ |
| Super Admin | ✅ | ✅ | ✅ |

### 6.3 其他安全措施

- **HTTPS**：生产环境强制启用
- **请求验证**：所有入参通过Zod Schema校验
- **SQL注入防护**：Prisma ORM参数化查询
- **XSS防护**：Vue自动转义 + CSP Header
- **文件上传**：限制类型（jpg/png/mp4）、大小（10MB）、病毒扫描（预留接口）
- **速率限制**：登录接口5次/分钟/IP
- **审计日志**：所有CRUD操作记录（userId、action、entity、时间戳）

---

## 七、合规要点

| 标准/法规 | 核心要求 | 系统对接点 |
|----------|---------|-----------|
| **GB 10631—2025** 烟花爆竹安全与质量 | 产品分类、安全标识、燃放说明 | 产品详情页展示执行标准、安全等级(C/D)、药量 |
| **AQ 4101—2026** 风险监测预警技术规范 | 视频监控、入侵检测、报警系统 | 8大场景识别、分级预警、UPS配置、网络冗余 |
| **AQ 4102—2026** 流向登记通用规范 | 产品全流程流向登记 | 进销存系统 + 流向码管理 + FlowReg表 |
| **AQ 4127—2026** 工程竣工验收规范 | 系统部署后的验收标准 | 竣工验收检查清单、整改跟踪 |
| **GB 50161** 烟花爆竹工程设计安全规范 | 电气安全、防爆、防雷 | 设备选型指导、布线规范建议 |
| **"五个严禁、三个务必"** | 严禁超量储存、店外摆放等 | 预警系统直接识别违规行为 |

### 预警映射表

| 违规行为 | 预警类型 | 预警等级 | 检测方式 |
|---------|---------|---------|---------|
| 超量储存 | OVERSTOCK | 🟠 橙色 | 库存量 vs Store.capacity |
| 店外摆放 | OUTDOOR_ILLEGAL | 🟡 黄色 | 摄像头AI识别 |
| 店内吸烟/点火 | SMOKING | 🔴 红色 | 摄像头AI识别（烟/火检测） |
| 店外试放 | OUTDOOR_TEST_FIRE | 🔴 红色 | 摄像头AI识别 + 声音检测 |
| 超范围经营 | OUT_OF_SCOPE_SALES | 🟠 橙色 | 产品类别 vs 许可范围对比 |
| 人员聚集 | CROWD_GATHERING | 🟡 黄色 | 摄像头AI人头计数 |
| 温湿度异常 | TEMP_HUMIDITY_ANOMALY | 🟠 橙色 | 传感器数据 > 阈值 |
| 火情/烟雾 | SMOKE_FIRE | 🔴 红色 | 烟雾探测器 + 温度突变 |

---

## 八、具体实施路径

### 第一阶段：方案确认与项目初始化（第1周）

| 任务 | 产出物 |
|------|--------|
| 技术方案文档定稿 | PROPOSAL.md |
| 项目结构搭建（前端+后端） | Monorepo目录结构 |
| 数据库Schema设计+首次迁移 | Prisma Schema + SQLite |
| 认证系统实现（JWT + RBAC） | 登录/注册API + 中间件 |

### 第二阶段：核心业务开发（第2-3周）

| 任务 | 产出物 |
|------|--------|
| 产品管理API + 顾客端H5 | 产品浏览、详情、下单 |
| 进销存+流向登记 | AQ 4102合规 |
| 企业管理后台 | 仪表盘、产品CRUD、库存、订单 |

### 第三阶段：预警与监管（第4-5周）

| 任务 | 产出物 |
|------|--------|
| 8大场景检测引擎 | riskDetection.ts |
| WebSocket实时推送 | Socket.IO实时预警 |
| 视频监控模块 | 摄像头画面展示 |
| 政府监管端 | 地图、一企一档、移动执法 |

### 第四阶段：验收与试运行（第6周）

| 任务 | 产出物 |
|------|--------|
| 端到端测试 | 全流程测试报告 |
| 种子数据填充 | 10+产品 + 门店 + 用户 |
| RBAC权限审查 | 权限矩阵验证 |
| 文档完善 | API文档 + 部署文档 |

---

> **文档版本**：v2.0 | **最后更新**：2026年6月 | **编制**：安万嘉城市公共安全技术研究院
