import { Injectable, Logger } from '@nestjs/common';

export enum OperationType {
  SUPPLY = 'supply',
  WITHDRAW = 'withdraw',
  BORROW = 'borrow',
  REPAY = 'repay',
  LIQUIDATE = 'liquidate',
  SET_COLLATERAL = 'setCollateral',
}

export enum OperationStatus {
  DRAFTED = 'drafted',
  BROADCAST = 'broadcast',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface OperationRecord {
  id: string;
  type: OperationType;
  status: OperationStatus;
  userAddr: string;
  asset: string;
  amount: string;
  txid?: string;
  draftData?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * History Service
 *
 * Records and retrieves operation history.
 */
@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  private readonly records: Map<string, OperationRecord> = new Map();

  /**
   * Record draft creation
   */
  async recordDraft(
    type: OperationType,
    userAddr: string,
    asset: string,
    amount: string,
    draftData: any,
  ): Promise<OperationRecord> {
    const id = this.generateId();
    const record: OperationRecord = {
      id,
      type,
      status: OperationStatus.DRAFTED,
      userAddr,
      asset,
      amount,
      draftData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.records.set(id, record);
    this.logger.log(`Recorded draft ${id} for ${type} by ${userAddr}`);
    return record;
  }

  /**
   * Record broadcast
   */
  async recordBroadcast(
    id: string,
    txid: string,
  ): Promise<OperationRecord | null> {
    const record = this.records.get(id);
    if (record) {
      record.txid = txid;
      record.status = OperationStatus.BROADCAST;
      record.updatedAt = new Date();
      this.records.set(id, record);
      this.logger.log(`Recorded broadcast for ${id}, txid: ${txid}`);
    }
    return record || null;
  }

  /**
   * Update operation status
   */
  async updateStatus(
    id: string,
    status: OperationStatus,
    error?: string,
  ): Promise<OperationRecord | null> {
    const record = this.records.get(id);
    if (record) {
      record.status = status;
      if (error) record.error = error;
      record.updatedAt = new Date();
      this.records.set(id, record);
      this.logger.log(`Updated ${id} status to ${status}`);
    }
    return record || null;
  }

  /**
   * Get user operation history
   */
  async getUserHistory(
    userAddr: string,
    options?: {
      offset?: number;
      limit?: number;
      status?: OperationStatus;
    },
  ): Promise<{ records: OperationRecord[]; total: number }> {
    const { offset = 0, limit = 20, status } = options || {};

    let records = Array.from(this.records.values()).filter(
      (r) => r.userAddr === userAddr,
    );

    if (status) {
      records = records.filter((r) => r.status === status);
    }

    // Sort by createdAt desc
    records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = records.length;
    const paginated = records.slice(offset, offset + limit);

    return { records: paginated, total };
  }

  /**
   * Get operation by id
   */
  async getOperation(id: string): Promise<OperationRecord | null> {
    return this.records.get(id) || null;
  }

  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
