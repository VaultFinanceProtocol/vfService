import { Injectable, Logger, NotImplementedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OperationType, QuotesService } from '../quotes/quotes.service';

/**
 * Transaction Input/Output types
 */
export interface TxInput {
  txid: string;
  vout: number;
  scriptPubKey?: string;
  value?: string;
}

export interface TxOutput {
  address?: string;
  scriptPubKey?: string;
  value: string;
}

/**
 * Transaction Draft
 */
export interface TransactionDraft {
  operation: OperationType;
  psbtBase64: string;
  inputs: TxInput[];
  outputs: TxOutput[];
  fee: string;
  estimatedSize: number;
  metadata: {
    requiresGuard: boolean;
    requiresCreateOp: boolean;
    hasRefundPath: boolean;
    expiryTime?: number;
  };
}

/**
 * Supply Transaction Request
 */
export interface SupplyTxRequest {
  userAddr: string;
  asset: string;
  amount: string;
  useAsCollateral: boolean;
  // UTXO inputs from user's wallet
  inputs: {
    txid: string;
    vout: number;
    value: string;
    scriptPubKey: string;
  }[];
}

/**
 * Withdraw Transaction Request
 */
export interface WithdrawTxRequest {
  userAddr: string;
  asset: string;
  shares: string;
  minAmount: string;
  // createOp backtrace info
  createOpTxid?: string;
  createOpVout?: number;
}

/**
 * Borrow Transaction Request
 */
export interface BorrowTxRequest {
  userAddr: string;
  asset: string;
  amount: string;
  // createOp backtrace info
  createOpTxid?: string;
  createOpVout?: number;
}

/**
 * Repay Transaction Request
 */
export interface RepayTxRequest {
  userAddr: string;
  asset: string;
  amount: string;
  useInternal: boolean;
  // External repay only
  inputs?: {
    txid: string;
    vout: number;
    value: string;
    scriptPubKey: string;
  }[];
}

/**
 * Transactions Service
 *
 * Creates transaction drafts following VF protocol rules:
 * - Vault input/output index rules
 * - Guard requirements
 * - 12 input/output limit
 * - Refund path handling
 *
 * Modes:
 * - createOp-backed
 * - user-funded
 * - internal
 * - external
 */
@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private configService: ConfigService,
    private quotesService: QuotesService,
  ) {}

  /**
   * Create supply transaction draft
   *
   * Transaction Structure (Token):
   * Inputs:
   *   0: Vault UTXO
   *   1: t/user (User's token UTXO)
   *   2: Supply UTXO
   * Outputs:
   *   0: Vault UTXO (updated state)
   *   1: t/vault (merged tokens)
   *   2: User change
   */
  async createSupplyDraft(request: SupplyTxRequest): Promise<TransactionDraft> {
    this.logger.log(`Creating supply draft for ${request.userAddr}, asset: ${request.asset}`);

    // Validate quote first
    const quote = await this.quotesService.getSupplyQuote({
      userAddr: request.userAddr,
      asset: request.asset,
      amount: request.amount,
      useAsCollateral: request.useAsCollateral,
    });

    if (!quote.feasible) {
      throw new BadRequestException(quote.reasons?.join(', ') || 'Quote not feasible');
    }

    // TODO: Build actual PSBT with vault contract
    // For now, return mock draft
    const mockPsbt = this.createMockPsbt('supply', request);

    return {
      operation: OperationType.SUPPLY,
      psbtBase64: mockPsbt,
      inputs: [
        { txid: 'vault_utxo_txid', vout: 0 },
        ...request.inputs.map((inp, idx) => ({
          txid: inp.txid,
          vout: inp.vout,
          value: inp.value,
          scriptPubKey: inp.scriptPubKey,
        })),
      ],
      outputs: [
        { value: '0', scriptPubKey: 'vault_script' }, // Updated vault
        { value: request.amount, scriptPubKey: 'token_vault_script' }, // Tokens to vault
        { value: '1000', address: request.userAddr }, // Change
      ],
      fee: quote.txPlan?.estimatedFee || '1000',
      estimatedSize: 500,
      metadata: {
        requiresGuard: false,
        requiresCreateOp: false,
        hasRefundPath: true,
        expiryTime: Date.now() + 3600 * 1000, // 1 hour expiry
      },
    };
  }

  /**
   * Create withdraw transaction draft
   *
   * Requires createOp backtrace verification
   */
  async createWithdrawDraft(request: WithdrawTxRequest): Promise<TransactionDraft> {
    this.logger.log(`Creating withdraw draft for ${request.userAddr}, asset: ${request.asset}`);

    const quote = await this.quotesService.getWithdrawQuote({
      userAddr: request.userAddr,
      asset: request.asset,
      shares: request.shares,
      minAmount: request.minAmount,
    });

    if (!quote.feasible) {
      throw new BadRequestException(quote.reasons?.join(', ') || 'Quote not feasible');
    }

    const mockPsbt = this.createMockPsbt('withdraw', request);

    return {
      operation: OperationType.WITHDRAW,
      psbtBase64: mockPsbt,
      inputs: [
        { txid: 'vault_utxo_txid', vout: 0 },
        { txid: request.createOpTxid || 'createop_txid', vout: request.createOpVout || 0 },
        { txid: 'withdraw_utxo', vout: 0 },
      ],
      outputs: [
        { value: '0', scriptPubKey: 'vault_script' },
        { value: quote.computed.amount || '0', address: request.userAddr },
        { value: '1000', address: request.userAddr }, // Change
      ],
      fee: quote.txPlan?.estimatedFee || '2000',
      estimatedSize: 600,
      metadata: {
        requiresGuard: false,
        requiresCreateOp: true,
        hasRefundPath: true,
        expiryTime: Date.now() + 3600 * 1000,
      },
    };
  }

  /**
   * Create borrow transaction draft
   *
   * Requires createOp backtrace verification
   */
  async createBorrowDraft(request: BorrowTxRequest): Promise<TransactionDraft> {
    this.logger.log(`Creating borrow draft for ${request.userAddr}, asset: ${request.asset}`);

    const quote = await this.quotesService.getBorrowQuote({
      userAddr: request.userAddr,
      asset: request.asset,
      amount: request.amount,
    });

    if (!quote.feasible) {
      throw new BadRequestException(quote.reasons?.join(', ') || 'Quote not feasible');
    }

    const mockPsbt = this.createMockPsbt('borrow', request);

    return {
      operation: OperationType.BORROW,
      psbtBase64: mockPsbt,
      inputs: [
        { txid: 'vault_utxo_txid', vout: 0 },
        { txid: request.createOpTxid || 'createop_txid', vout: request.createOpVout || 0 },
        { txid: 'borrow_utxo', vout: 0 },
      ],
      outputs: [
        { value: '0', scriptPubKey: 'vault_script' },
        { value: request.amount, address: request.userAddr },
        { value: '1000', address: request.userAddr },
      ],
      fee: quote.txPlan?.estimatedFee || '2000',
      estimatedSize: 600,
      metadata: {
        requiresGuard: false,
        requiresCreateOp: true,
        hasRefundPath: true,
        expiryTime: Date.now() + 3600 * 1000,
      },
    };
  }

  /**
   * Create repay transaction draft
   *
   * Internal: Uses supply position
   * External: Uses wallet tokens (requires guard)
   */
  async createRepayDraft(request: RepayTxRequest): Promise<TransactionDraft> {
    this.logger.log(`Creating repay draft for ${request.userAddr}, asset: ${request.asset}, internal: ${request.useInternal}`);

    const quote = await this.quotesService.getRepayQuote({
      userAddr: request.userAddr,
      asset: request.asset,
      amount: request.amount,
      useInternal: request.useInternal,
    });

    if (!quote.feasible) {
      throw new BadRequestException(quote.reasons?.join(', ') || 'Quote not feasible');
    }

    const mockPsbt = this.createMockPsbt('repay', request);

    const inputs: TxInput[] = [
      { txid: 'vault_utxo_txid', vout: 0 },
      { txid: 'token_vault_utxo', vout: 0 },
    ];

    if (!request.useInternal && request.inputs) {
      inputs.push(...request.inputs.map((inp) => ({
        txid: inp.txid,
        vout: inp.vout,
        value: inp.value,
        scriptPubKey: inp.scriptPubKey,
      })));
    } else {
      inputs.push({ txid: 'repay_internal_utxo', vout: 0 });
    }

    if (!request.useInternal) {
      inputs.push({ txid: 'guard_utxo', vout: 0 });
    }

    return {
      operation: OperationType.REPAY,
      psbtBase64: mockPsbt,
      inputs,
      outputs: [
        { value: '0', scriptPubKey: 'vault_script' },
        { value: request.amount, scriptPubKey: 'token_vault_script' },
        { value: '1000', address: request.userAddr },
      ],
      fee: quote.txPlan?.estimatedFee || '2500',
      estimatedSize: 700,
      metadata: {
        requiresGuard: !request.useInternal,
        requiresCreateOp: request.useInternal,
        hasRefundPath: true,
        expiryTime: Date.now() + 3600 * 1000,
      },
    };
  }

  /**
   * Create mock PSBT for development
   * TODO: Replace with actual PSBT building using vaultfinance SDK
   */
  private createMockPsbt(operation: string, request: any): string {
    // Mock base64 PSBT string
    const mockData = Buffer.from(JSON.stringify({
      operation,
      request,
      timestamp: Date.now(),
      mock: true,
    })).toString('base64');

    return mockData;
  }
}
