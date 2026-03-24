# VaultFinance Service (vfService)

VaultFinance 借贷协议的后端与前端服务。

## 项目结构

```
vfService/
├── packages/
│   ├── backend/              # NestJS 后端
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── protocol/      # 协议适配层（读取链上状态）
│   │   │   │   ├── vault/         # Vault 全局状态
│   │   │   │   ├── pools/         # 资产池管理
│   │   │   │   ├── positions/     # 用户仓位
│   │   │   │   ├── quotes/        # 报价计算
│   │   │   │   ├── transactions/  # 交易构建
│   │   │   │   ├── execution/     # 交易广播执行
│   │   │   │   ├── history/       # 历史记录
│   │   │   │   ├── liquidation/   # 清算管理
│   │   │   │   ├── admin/         # 管理接口
│   │   │   │   ├── price/         # 价格服务
│   │   │   │   ├── workers/       # 后台任务 (BullMQ)
│   │   │   │   └── websocket/     # WebSocket 网关
│   │   │   ├── config/            # 配置
│   │   │   ├── common/            # 通用工具
│   │   │   └── main.ts            # 入口
│   │   └── package.json
│   └── frontend/             # React + Vite 前端
│       ├── src/
│       │   ├── pages/        # 页面组件
│       │   ├── components/   # UI 组件
│       │   ├── hooks/        # 自定义 hooks
│       │   ├── services/     # API 服务
│       │   ├── types/        # TypeScript 类型
│       │   ├── utils/        # 工具函数
│       │   └── App.tsx
│       └── package.json
├── .github/workflows/        # CI/CD 工作流
│   ├── test.yml             # 测试
│   ├── deploy-testnet.yml   # 测试网部署
│   └── deploy-production.yml # 生产部署
├── docker-compose.yml        # PostgreSQL + Redis
├── docker-compose.production.yml # 生产 Docker Compose
├── Dockerfile               # 多阶段构建
├── ecosystem.config.js      # PM2 配置
├── nginx/nginx.conf         # Nginx 配置
└── package.json             # Monorepo 根配置
```

## 快速开始

### 1. 启动基础设施

```bash
# 复制环境变量
cp packages/backend/.env.example packages/backend/.env

# 启动 PostgreSQL 和 Redis
docker-compose up -d
```

### 2. 安装依赖

```bash
npm run install:all
```

### 3. 启动开发服务器

```bash
# 同时启动前后端
npm run start:dev

# 或单独启动
npm run start:backend:api   # http://localhost:3000
npm run start:frontend:dev  # http://localhost:5173
```

### 4. 访问服务

- 前端: http://localhost:5173
- 后端 API: http://localhost:3000/api/v1
- API 文档: http://localhost:3000/docs

## 核心功能

### 后端模块

| 模块 | 功能 |
|------|------|
| `protocol` | 协议适配层，读取链上状态 |
| `vault` | Vault 全局状态和统计 |
| `pools` | 资产池列表、详情、统计 |
| `positions` | 用户仓位、健康因子、账户数据 |
| `quotes` | Supply/Withdraw/Borrow/Repay 报价计算 |
| `transactions` | 交易草稿生成 (PSBT) |
| `execution` | 交易广播、状态追踪 |
| `liquidation` | 清算检测和预览 |
| `history` | 操作历史记录 |
| `workers` | BullMQ 后台任务（交易广播、价格更新、清算扫描） |
| `websocket` | WebSocket 实时推送 |
| `price` | 价格服务 |
| `admin` | 池管理、暂停/恢复 |

### 前端页面

| 页面 | 功能 |
|------|------|
| `Dashboard` | 协议统计、市场概览 |
| `Markets` | 池列表、搜索、筛选 |
| `Market Detail` | 池详情、Supply/Borrow、报价预览 |
| `Positions` | 我的仓位、健康因子、Withdraw/Repay 操作 |
| `Liquidations` | 可清算列表、执行清算、利润预览 |
| `History` | 交易历史、状态筛选 |

## API 端点

### Vault & Protocol
- `GET /api/v1/vault/config` - Vault 配置
- `GET /api/v1/vault/stats` - 协议统计

### Pools
- `GET /api/v1/pools` - 池列表（分页）
- `GET /api/v1/pools/search?q=` - 搜索池
- `GET /api/v1/pools/:asset` - 池详情
- `GET /api/v1/pools/:asset/stats` - 池统计

### Positions
- `GET /api/v1/positions/:address` - 用户仓位总览
- `GET /api/v1/positions/:address/health` - 健康因子
- `GET /api/v1/positions/:address/account-data` - 账户聚合数据

### Quotes
- `POST /api/v1/quotes/supply` - 供应报价
- `POST /api/v1/quotes/withdraw` - 提取报价
- `POST /api/v1/quotes/borrow` - 借款报价
- `POST /api/v1/quotes/repay` - 还款报价

### Transactions
- `POST /api/v1/transactions/supply/draft` - 供应草稿
- `POST /api/v1/transactions/withdraw/draft` - 提取草稿
- `POST /api/v1/transactions/borrow/draft` - 借款草稿
- `POST /api/v1/transactions/repay/draft` - 还款草稿
- `POST /api/v1/transactions/broadcast` - 广播交易
- `GET /api/v1/transactions/:txid` - 查询交易状态

### Liquidations
- `GET /api/v1/liquidations/available` - 可清算仓位列表
- `GET /api/v1/liquidations/:address/check` - 检查仓位是否可清算
- `POST /api/v1/liquidations/preview` - 清算预览

### History
- `GET /api/v1/history?address={address}` - 操作历史
- `GET /api/v1/history/:id` - 操作详情

## WebSocket 事件

### 客户端发送
- `subscribe:protocol` - 订阅协议统计
- `subscribe:pool` - 订阅池更新
- `subscribe:position` - 订阅仓位更新
- `unsubscribe` - 取消订阅

### 服务器推送
- `protocol:stats` - 协议统计更新
- `pool:update` - 池数据更新
- `position:update` - 仓位数据更新
- `price:update` - 价格更新
- `liquidation:alert` - 清算警报
- `transaction:confirmation` - 交易确认

## 技术栈

### 后端
- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Cache/Queue**: Redis + BullMQ
- **Real-time**: WebSocket (Socket.io)
- **Documentation**: Swagger/OpenAPI

### 前端
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Data Fetching**: SWR
- **Routing**: React Router

## CI/CD

### GitHub Actions 工作流

1. **test.yml** - PR/Push 触发
   - Lint 和类型检查
   - 单元测试
   - 构建验证

2. **deploy-testnet.yml** - 推送到 dev 分支触发
   - SSH 部署到测试服务器
   - Docker 容器管理
   - 数据库迁移
   - PM2 进程管理

3. **deploy-production.yml** - 推送到 main 分支触发
   - Docker 镜像构建
   - GCP Artifact Registry 推送
   - Cloud Run 部署

### 环境变量配置

#### 必需 Secrets
- `DEPLOY_SSH_KEY` - SSH 部署密钥
- `DATABASE_PASSWORD` - PostgreSQL 密码
- `REDIS_PASSWORD` - Redis 密码
- `JWT_SECRET` - JWT 签名密钥
- `GCP_WIF_PROVIDER` - GCP Workload Identity Provider
- `GCP_WIF_SERVICE_ACCOUNT` - GCP 服务账号

#### 必需 Variables
- `DEPLOY_HOST` - 部署服务器地址
- `DEPLOY_USER` - SSH 用户名
- `DATABASE_HOST` - PostgreSQL 主机
- `REDIS_HOST` - Redis 主机
- `GCP_PROJECT_ID` - GCP 项目 ID

## 测试数据

后端使用 Mock 数据（3 个测试池）：
- **BTC** - 流动性 1000 BTC, 供应 APY 2.5%, 借款 APY 8%
- **USDT** - 流动性 50,000 USDT, 供应 APY 4.5%, 借款 APY 12%
- **CAT** - 流动性 200,000 CAT, 供应 APY 8%, 借款 APY 18%

## 开发计划

- [x] Phase 1: 项目初始化与基础架构
- [x] Phase 2: 协议适配层 + Pools & Vault
- [x] Phase 3: Positions & Transactions
- [x] Phase 4: Quotes, Liquidation, Admin + Workers, WebSocket, Cache
- [x] Phase 5: 前端页面开发 (Dashboard, Markets, Positions, Liquidations, History)
- [x] Phase 6: CI/CD 配置 (GitHub Actions, Docker, PM2)

## 项目仓库

https://github.com/VaultFinanceProtocol/vfService
