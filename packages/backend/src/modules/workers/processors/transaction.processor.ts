import { Processor, Process, OnQueueFailed } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ExecutionService, TransactionStatus } from '../../execution/execution.service';
import { HistoryService, OperationType, OperationStatus } from '../../history/history.service';

interface TransactionJobData {
  txid: string;
  signedTx: string;
  operation: string;
  userAddr: string;
  asset: string;
  amount: string;
  operationId: string;
}

@Processor('transactions', {
  concurrency: 3,
})
export class TransactionProcessor {
  private readonly logger = new Logger(TransactionProcessor.name);

  constructor(
    private executionService: ExecutionService,
    private historyService: HistoryService,
  ) {}

  @Process('broadcast')
  async handleBroadcast(job: Job<TransactionJobData>) {
    const { txid, signedTx, operation, userAddr, asset, amount, operationId } = job.data;

    this.logger.log(`Processing broadcast job ${job.id} for tx ${txid}`);

    try {
      // Update operation status to broadcast
      await this.historyService.updateStatus(operationId, OperationStatus.BROADCAST);

      // Broadcast to blockchain
      const result = await this.executionService.broadcast(signedTx, {
        operation,
        userAddr,
        asset,
        amount,
      });

      // Poll for confirmation
      await this.pollForConfirmation(result.txid, operationId);

      return { success: true, txid: result.txid };
    } catch (error) {
      this.logger.error(`Failed to broadcast transaction ${txid}:`, error);
      await this.historyService.updateStatus(
        operationId,
        OperationStatus.FAILED,
        error.message,
      );
      throw error;
    }
  }

  @Process('confirm')
  async handleConfirmation(job: Job<{ txid: string; operationId: string }>) {
    const { txid, operationId } = job.data;

    this.logger.log(`Processing confirmation for tx ${txid}`);

    try {
      // Poll for confirmation
      await this.pollForConfirmation(txid, operationId);
      return { success: true, txid };
    } catch (error) {
      this.logger.error(`Failed to confirm transaction ${txid}:`, error);
      throw error;
    }
  }

  private async pollForConfirmation(txid: string, operationId: string) {
    const maxAttempts = 60; // 10 minutes with 10-second intervals
    const interval = 10000; // 10 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, interval));

      const tx = await this.executionService.getTransaction(txid);

      if (!tx) {
        this.logger.warn(`Transaction ${txid} not found`);
        continue;
      }

      if (tx.status === TransactionStatus.CONFIRMED) {
        this.logger.log(`Transaction ${txid} confirmed`);
        await this.historyService.updateStatus(operationId, OperationStatus.CONFIRMED);
        return;
      }

      if (tx.status === TransactionStatus.FAILED) {
        throw new Error(`Transaction ${txid} failed: ${tx.error}`);
      }

      this.logger.debug(`Waiting for confirmation... Attempt ${attempt + 1}/${maxAttempts}`);
    }

    throw new Error(`Transaction ${txid} confirmation timeout`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed: ${error.message}`,
      error.stack,
    );
  }
}
