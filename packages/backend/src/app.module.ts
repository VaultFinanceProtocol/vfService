import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';

import { configuration } from './config/configuration';
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';

// Common & Health
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';

// Feature Modules (following Codex architecture)
import { VaultModule } from './modules/vault/vault.module';
import { ProtocolModule } from './modules/protocol/protocol.module';
import { PoolsModule } from './modules/pools/pools.module';
import { PositionsModule } from './modules/positions/positions.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { HistoryModule } from './modules/history/history.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),

    // Redis / BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfig,
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Common & Health
    CommonModule,
    HealthModule,

    // Feature Modules
    VaultModule,
    ProtocolModule,
    PoolsModule,
    PositionsModule,
    QuotesModule,
    TransactionsModule,
    ExecutionModule,
    HistoryModule,
    AdminModule,
  ],
})
export class AppModule {}
