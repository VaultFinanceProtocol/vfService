import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

/**
 * History Module
 *
 * Records operation history:
 * - Draft requests
 * - Broadcast results
 * - Transaction status
 *
 * Lightweight version for MVP.
 * Full indexer to be added later.
 */
@Module({
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
