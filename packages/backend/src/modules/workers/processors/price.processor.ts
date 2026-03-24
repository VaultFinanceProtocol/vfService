import { Processor, Process, OnQueueFailed } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PriceService } from '../../price/price.service';
import { PoolsService } from '../../pools/pools.service';

interface PriceUpdateJobData {
  asset: string;
  force?: boolean;
}

@Processor('prices', {
  concurrency: 5,
})
export class PriceProcessor {
  private readonly logger = new Logger(PriceProcessor.name);

  constructor(
    private priceService: PriceService,
    private poolsService: PoolsService,
  ) {}

  @Process('update')
  async handlePriceUpdate(job: Job<PriceUpdateJobData>) {
    const { asset, force } = job.data;

    this.logger.debug(`Updating price for asset ${asset}`);

    try {
      // Fetch price from oracle/sources
      const price = await this.priceService.fetchPrice(asset);

      if (price) {
        this.logger.log(`Price updated for ${asset}: $${price}`);

        // Update pool stats with new price
        await this.poolsService.updatePoolPrice(asset, price);

        return { success: true, asset, price };
      }

      return { success: false, asset, error: 'Price not available' };
    } catch (error) {
      this.logger.error(`Failed to update price for ${asset}:`, error);
      throw error;
    }
  }

  @Process('update-all')
  async handleUpdateAllPrices(job: Job) {
    this.logger.log('Running price update for all assets');

    try {
      // Get all active pools
      const pools = await this.poolsService.getActivePools();

      this.logger.log(`Updating prices for ${pools.length} pools`);

      const results = [];
      for (const pool of pools) {
        try {
          const price = await this.priceService.fetchPrice(pool.asset);
          if (price) {
            await this.poolsService.updatePoolPrice(pool.asset, price);
            results.push({ asset: pool.asset, price, success: true });
          }
        } catch (error) {
          this.logger.error(`Failed to update price for ${pool.asset}:`, error);
          results.push({ asset: pool.asset, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      this.logger.log(`Price update completed: ${successCount}/${results.length} successful`);

      return { success: true, results, count: results.length, successCount };
    } catch (error) {
      this.logger.error('Price update all failed:', error);
      throw error;
    }
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Price job ${job.id} of type ${job.name} failed: ${error.message}`,
      error.stack,
    );
  }
}
