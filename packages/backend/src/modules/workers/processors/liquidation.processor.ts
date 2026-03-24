import { Processor, Process, OnQueueFailed } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { LiquidationService } from '../../liquidation/liquidation.service';
import { PositionsService } from '../../positions/positions.service';

interface LiquidationJobData {
  borrowerAddr: string;
  debtAsset: string;
  collAsset: string;
  repayAmount: string;
}

@Processor('liquidations', {
  concurrency: 2,
})
export class LiquidationProcessor {
  private readonly logger = new Logger(LiquidationProcessor.name);

  constructor(
    private liquidationService: LiquidationService,
    private positionsService: PositionsService,
  ) {}

  @Process('scan')
  async handleLiquidationScan(job: Job) {
    this.logger.log(`Running liquidation scan job ${job.id}`);

    try {
      // Find liquidatable positions
      const positions = await this.liquidationService.findLiquidatablePositions();

      this.logger.log(`Found ${positions.length} liquidatable positions`);

      // Log each position for monitoring
      for (const position of positions) {
        this.logger.warn(
          `LIQUIDATION OPPORTUNITY: User ${position.userAddr} ` +
          `has HF ${position.healthFactor} with ${position.symbol} debt`,
        );
      }

      return {
        success: true,
        count: positions.length,
        positions: positions.map(p => ({
          userAddr: p.userAddr,
          healthFactor: p.healthFactor,
          symbol: p.symbol,
        })),
      };
    } catch (error) {
      this.logger.error('Liquidation scan failed:', error);
      throw error;
    }
  }

  @Process('execute')
  async handleLiquidationExecution(job: Job<LiquidationJobData>) {
    const { borrowerAddr, debtAsset, collAsset, repayAmount } = job.data;

    this.logger.log(
      `Processing liquidation execution for ${borrowerAddr}`,
    );

    try {
      // Preview liquidation
      const preview = await this.liquidationService.previewLiquidation(
        borrowerAddr,
        debtAsset,
        collAsset,
        repayAmount,
      );

      this.logger.log(
        `Liquidation preview: Repay ${preview.repayValueUSD} USD, ` +
        `Seize ${preview.seizeValueUSD} USD, Profit ${preview.bonusValueUSD} USD`,
      );

      // TODO: Execute actual liquidation transaction
      // This would require:
      // 1. Creating liquidation transaction
      // 2. Signing with liquidator key
      // 3. Broadcasting to blockchain

      return {
        success: true,
        preview,
        message: 'Liquidation preview generated - execution pending',
      };
    } catch (error) {
      this.logger.error(`Liquidation execution failed for ${borrowerAddr}:`, error);
      throw error;
    }
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Liquidation job ${job.id} of type ${job.name} failed: ${error.message}`,
      error.stack,
    );
  }
}
