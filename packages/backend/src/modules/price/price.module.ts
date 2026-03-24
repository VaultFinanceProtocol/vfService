import { Module } from '@nestjs/common';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';

/**
 * Price Module
 *
 * Manages asset price data.
 * - Oracle integration
 * - Price caching
 * - USD conversion
 */
@Module({
  controllers: [PriceController],
  providers: [PriceService],
  exports: [PriceService],
})
export class PriceModule {}
