import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WorkersService implements OnModuleInit {
  private readonly logger = new Logger(WorkersService.name);

  constructor(
    @InjectQueue('transactions') private transactionQueue: Queue,
    @InjectQueue('liquidations') private liquidationQueue: Queue,
    @InjectQueue('prices') private priceQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('Workers service initialized');
    this.logger.log(`Transaction queue: ${this.transactionQueue.name}`);
    this.logger.log(`Liquidation queue: ${this.liquidationQueue.name}`);
    this.logger.log(`Price queue: ${this.priceQueue.name}`);
  }

  /**
   * Add transaction broadcast job
   */
  async addTransactionJob(data: {
    txid: string;
    signedTx: string;
    operation: string;
    userAddr: string;
    asset: string;
    amount: string;
    operationId: string;
  }) {
    this.logger.log(`Adding transaction job for ${data.txid}`);
    return this.transactionQueue.add('broadcast', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  /**
   * Add confirmation job
   */
  async addConfirmationJob(txid: string, operationId: string) {
    this.logger.log(`Adding confirmation job for ${txid}`);
    return this.transactionQueue.add('confirm', { txid, operationId }, {
      attempts: 5,
      backoff: {
        type: 'fixed',
        delay: 10000,
      },
    });
  }

  /**
   * Add liquidation execution job
   */
  async addLiquidationJob(data: {
    borrowerAddr: string;
    debtAsset: string;
    collAsset: string;
    repayAmount: string;
  }) {
    this.logger.log(`Adding liquidation job for ${data.borrowerAddr}`);
    return this.liquidationQueue.add('execute', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
    });
  }

  /**
   * Add price update job
   */
  async addPriceUpdateJob(asset: string, force = false) {
    this.logger.debug(`Adding price update job for ${asset}`);
    return this.priceQueue.add('update', { asset, force }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  /**
   * Scheduled: Run liquidation scan every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledLiquidationScan() {
    this.logger.log('Running scheduled liquidation scan');
    return this.liquidationQueue.add('scan', {}, {
      jobId: 'liquidation-scan-scheduled',
    });
  }

  /**
   * Scheduled: Update all prices every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async scheduledPriceUpdate() {
    this.logger.debug('Running scheduled price update');
    return this.priceQueue.add('update-all', {}, {
      jobId: 'price-update-scheduled',
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [transactionStats, liquidationStats, priceStats] = await Promise.all([
      this.transactionQueue.getJobCounts(),
      this.liquidationQueue.getJobCounts(),
      this.priceQueue.getJobCounts(),
    ]);

    return {
      transactions: transactionStats,
      liquidations: liquidationStats,
      prices: priceStats,
    };
  }
}
