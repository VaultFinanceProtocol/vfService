import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

/**
 * Position Entity
 *
 * Mirrors the on-chain UserPosition from VaultFinance protocol.
 * Stores user supply/borrow positions.
 */
@Entity('positions')
@Index(['ownerAddr', 'asset'], { unique: true })
export class PositionEntity {
  @PrimaryColumn('varchar', { length: 64, comment: 'Owner address script hash' })
  ownerAddr: string;

  @PrimaryColumn('varchar', { length: 64, comment: 'Asset script hash' })
  asset: string;

  // Supply side
  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'LP shares from supply' })
  suppliedShares: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Original supplied amount' })
  suppliedAmount: string;

  @Column('boolean', { default: false, comment: 'Whether supply is used as collateral' })
  usedAsCollateral: boolean;

  // Borrow side
  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Borrowed shares' })
  drawnShares: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Original borrowed amount' })
  principal: string;

  // Premium tracking
  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Premium shares' })
  premiumShares: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Premium offset (signed, in RAY)' })
  premiumOffsetRay: string;

  // Risk config versioning
  @Column('bigint', { default: 1, comment: 'Supply risk config version' })
  supplyRiskVersion: number;

  @Column('bigint', { default: 1, comment: 'Borrow risk config version' })
  borrowRiskVersion: number;

  // Time tracking
  @Column('bigint', { default: 0, comment: 'Last update timestamp' })
  lastUpdatedTime: number;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Accumulated supply * time' })
  supplyPositionTime: string;

  @Column('decimal', { precision: 78, scale: 0, default: 0, comment: 'Accumulated debt * time' })
  borrowPositionTime: string;

  @Column('timestamptz', { default: () => 'NOW()' })
  createdAt: Date;

  @Column('timestamptz', { default: () => 'NOW()' })
  updatedAt: Date;
}
