import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProtocolService } from '../protocol/protocol.service';

export interface VaultStats {
  totalValueLocked: string;
  totalSupplied: string;
  totalBorrowed: string;
  poolCount: number;
}

/**
 * Vault Service
 *
 * Manages global vault state and statistics.
 */
@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);

  constructor(
    private configService: ConfigService,
    private protocolService: ProtocolService,
  ) {}

  /**
   * Get vault configuration
   */
  getVaultConfig() {
    return {
      genesisOutpoint: this.configService.get('VAULT_GENESIS_OUTPOINT', ''),
      scriptHash: this.configService.get('VAULT_SCRIPT_HASH', ''),
      flashLoanFeeRate: this.configService.get('FLASH_LOAN_FEE_RATE', 9),
    };
  }

  /**
   * Get protocol statistics
   */
  async getProtocolStats(): Promise<VaultStats> {
    return this.protocolService.getProtocolStats();
  }
}
