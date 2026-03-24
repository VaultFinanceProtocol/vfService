import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

/**
 * Pool Entity
 *
 * Mirrors the on-chain PoolState from VaultFinance protocol.
 * Stores asset pool metadata and current state.
 */
@Entity('pools')
@Index(['asset'], { unique: true })
export class PoolEntity {
  @PrimaryColumn('varchar', { length: 64, comment: 'Asset script hash (32 bytes hex)' })
  asset: string;

  @Column('bigint', { comment: 'Reserve ID for bitmap operations' })
  reserveId: number;

  @Column('smallint', { comment: 'Token decimals' })
  decimals: number;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Available liquidity' })
  liquidity: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Total LP shares' })
  addedShares: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Total borrowed shares' })
  drawnShares: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Premium shares' })
  premiumShares: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Drawn index (RAY = 1e27)' })
  drawnIndex: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Drawn rate' })
  drawnRate: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Accrued protocol fees' })
  accruedFees: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Liquidity fee in BPS' })
  liquidityFee: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Deficit (bad debt) in RAY' })
  deficitRay: string;

  @Column('bigint', { default: 0, comment: 'Last update timestamp' })
  lastUpdateTimestamp: number;

  @Column('boolean', { default: false, comment: 'Whether pool is paused' })
  paused: boolean;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Supply cap (0 = unlimited)' })
  supplyCap: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Borrow cap (0 = unlimited)' })
  borrowCap: string;

  @Column('jsonb', { comment: 'Interest rate parameters', default: {} })
  interestRateData: {
    optimalUsageRatio: string;
    baseVariableBorrowRate: string;
    variableRateSlope1: string;
    variableRateSlope2: string;
  };

  @Column('bigint', { default: 1, comment: 'Current risk config version' })
  currentRiskVersion: number;

  @Column('smallint', { default: 0, comment: 'Collateral risk in BPS' })
  collateralRisk: number;

  @Column('smallint', { default: 7500, comment: 'LTV in BPS (7500 = 75%)' })
  ltv: number;

  @Column('smallint', { default: 8000, comment: 'Liquidation threshold in BPS' })
  liquidationThreshold: number;

  @Column('smallint', { default: 500, comment: 'Liquidation bonus in BPS' })
  liquidationBonus: number;

  // Metadata
  @Column('varchar', { length: 32, nullable: true, comment: 'Token symbol' })
  symbol: string;

  @Column('varchar', { length: 128, nullable: true, comment: 'Token name' })
  name: string;

  @Column('text', { nullable: true, comment: 'Token image URL' })
  imageUrl: string;

  @Column('timestamptz', { default: () => 'NOW()', comment: 'Record created at' })
  createdAt: Date;

  @Column('timestamptz', { default: () => 'NOW()', comment: 'Record updated at' })
  updatedAt: Date;
}
