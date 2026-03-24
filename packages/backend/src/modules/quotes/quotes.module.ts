import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { ProtocolModule } from '../protocol/protocol.module';
import { PoolsModule } from '../pools/pools.module';
import { PositionsModule } from '../positions/positions.module';

/**
 * Quotes Module
 *
 * Provides quote calculation for all operations.
 * - Feasibility check
 * - Amount/shares calculation
 * - Health factor before/after
 * - Risk warnings
 * - Transaction plan
 */
@Module({
  imports: [ProtocolModule, PoolsModule, PositionsModule],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
