import { Module } from '@nestjs/common';
import { ExecutionService } from './execution.service';

/**
 * Execution Module
 *
 * Handles transaction broadcast and status tracking.
 * - Broadcast to blockchain
 * - Poll for confirmation
 * - Archive status
 * - BullMQ queue (for later)
 */
@Module({
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
