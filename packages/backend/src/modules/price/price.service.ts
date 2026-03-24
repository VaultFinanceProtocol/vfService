import { Injectable, Logger } from '@nestjs/common';

export interface PriceData {
  asset: string;
  symbol: string;
  priceUSD: string;
  timestamp: number;
  source: string;
}

/**
 * Price Service
 *
 * Manages asset price data.
 * - Oracle integration
 * - Price caching
 * - USD conversion
 */
@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  // Mock price feed
  private readonly mockPrices: Record<string, number> = {
    '0000000000000000000000000000000000000000000000000000000000000000': 65000, // BTC
    'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 1, // USDT
    'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1': 0.1, // CAT
  };

  private readonly mockSymbols: Record<string, string> = {
    '0000000000000000000000000000000000000000000000000000000000000000': 'BTC',
    'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 'USDT',
    'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1': 'CAT',
  };

  /**
   * Get asset price
   */
  async getPrice(asset: string): Promise<PriceData | null> {
    const price = this.mockPrices[asset];
    if (!price) {
      return null;
    }

    return {
      asset,
      symbol: this.mockSymbols[asset] || 'UNKNOWN',
      priceUSD: price.toFixed(2),
      timestamp: Date.now(),
      source: 'mock',
    };
  }

  /**
   * Get all prices
   */
  async getAllPrices(): Promise<PriceData[]> {
    return Object.keys(this.mockPrices).map((asset) => ({
      asset,
      symbol: this.mockSymbols[asset] || 'UNKNOWN',
      priceUSD: this.mockPrices[asset].toFixed(2),
      timestamp: Date.now(),
      source: 'mock',
    }));
  }

  /**
   * Convert amount to USD
   */
  async convertToUSD(asset: string, amount: string, decimals: number): Promise<string> {
    const price = this.mockPrices[asset];
    if (!price) return '0';

    const amountNum = Number(amount) / 10 ** decimals;
    return (amountNum * price).toFixed(2);
  }
}
