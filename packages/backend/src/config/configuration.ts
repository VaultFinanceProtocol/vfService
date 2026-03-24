export const configuration = () => ({
  // API
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PORT: parseInt(process.env.API_PORT || '3000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api',

  // Database
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'vaultfinance',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || 'redis',
  },

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',

  // Admin
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',

  // Blockchain
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:38443',
  BLOCKCHAIN_RPC_USER: process.env.BLOCKCHAIN_RPC_USER || 'user',
  BLOCKCHAIN_RPC_PASSWORD: process.env.BLOCKCHAIN_RPC_PASSWORD || 'password',
  BLOCKCHAIN_NETWORK: process.env.BLOCKCHAIN_NETWORK || 'regtest',

  // Vault Contract
  VAULT_GENESIS_OUTPOINT: process.env.VAULT_GENESIS_OUTPOINT || '',
  VAULT_SCRIPT_HASH: process.env.VAULT_SCRIPT_HASH || '',

  // Oracle
  ORACLE_PUBKEY_N: process.env.ORACLE_PUBKEY_N || '',
  ORACLE_API_URL: process.env.ORACLE_API_URL || '',

  // Fees
  FLASH_LOAN_FEE_RATE: parseInt(process.env.FLASH_LOAN_FEE_RATE || '9', 10),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_FORMAT: process.env.LOG_FORMAT || 'pretty',
});
