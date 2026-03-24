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
│   │   │   │   └── price/         # 价格服务
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
├── docker-compose.yml        # PostgreSQL + Redis
└── package.json              # Monorepo 根配置
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
npm run start:backend:dev   # http://localhost:3000
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
| `admin` | 池管理、暂停/恢复 |

### 前端页面

| 页面 | 功能 |
|------|------|
| `Dashboard` | 协议统计、市场概览 |
| `Markets` | 池列表、搜索、筛选 |
| `Market Detail` | 池详情、Supply/Borrow、报价预览 |
| `Positions` | 我的仓位、健康因子、Supplied/Borrowed 资产 |
| `Liquidations` | 可清算列表 (开发中) |

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

## 技术栈

### 后端
- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Cache/Queue**: Redis + BullMQ
- **Documentation**: Swagger/OpenAPI

### 前端
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Data Fetching**: SWR
- **Routing**: React Router

## 测试数据

后端使用 Mock 数据（3 个测试池）：
- **BTC** - 流动性 1000 BTC, 供应 APY 2.5%, 借款 APY 8%
- **USDT** - 流动性 50,000 USDT, 供应 APY 4.5%, 借款 APY 12%
- **CAT** - 流动性 200,000 CAT, 供应 APY 8%, 借款 APY 18%

## 开发计划

- [x] Phase 1: 项目初始化与基础架构
- [x] Phase 2: 协议适配层 + Pools & Vault
- [x] Phase 3: Positions & Transactions
- [x] Phase 4: Quotes, Liquidation, Admin
- [x] Phase 5: 前端页面开发
- [ ] Phase 6: 集成测试与部署

## 下一步

1. 集成真实的 VaultFinance SDK
2. 实现钱包连接 (UniSat/OKX)
3. 添加交易签名和广播
4. 部署到测试网
