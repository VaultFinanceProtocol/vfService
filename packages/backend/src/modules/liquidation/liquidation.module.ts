import { Module } from '@nestjs/common';
import { LiquidationController } from './liquidation.controller';
import { LiquidationService } from './liquidation.service';
import { ProtocolModule } from '../protocol/protocol.module';
import { PoolsModule } from '../pools/pools.module';
import { PositionsModule } from '../positions/positions.module';

/**
 * Liquidation Module
 *
 * Detects and manages liquidations.
 * - Scans for underwater positions (HF < 1.0)
 * - Calculates liquidation opportunities
 * - Generates liquidation transactions
 */
@Module({
  imports: [ProtocolModule, PoolsModule, PositionsModule],
  controllers: [LiquidationController],
  providers: [LiquidationService],
  exports: [LiquidationService],
})
export class LiquidationModule {}
