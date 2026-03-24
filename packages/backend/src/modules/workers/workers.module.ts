import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkersService } from './workers.service';
import { TransactionProcessor } from './processors/transaction.processor';
import { LiquidationProcessor } from './processors/liquidation.processor';
import { PriceProcessor } from './processors/price.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'transactions' },
      { name: 'liquidations' },
      { name: 'prices' },
    ),
  ],
  providers: [
    WorkersService,
    TransactionProcessor,
    LiquidationProcessor,
    PriceProcessor,
  ],
  exports: [WorkersService],
})
export class WorkersModule {}
