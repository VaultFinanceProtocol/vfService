import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { QuotesModule } from '../quotes/quotes.module';
import { ExecutionModule } from '../execution/execution.module';

/**
 * Transactions Module
 *
 * Handles transaction draft creation.
 * - Assembles transaction drafts
 * - Does NOT broadcast directly
 * - Returns PSBT drafts for client signing
 */
@Module({
  imports: [QuotesModule, ExecutionModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
