import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PriceService } from './price.service';
import { okResponse } from '../../common/utils/ok-response.util';

@ApiTags('Prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all asset prices' })
  async getAllPrices() {
    const prices = await this.priceService.getAllPrices();
    return okResponse(prices);
  }

  @Get(':asset')
  @ApiOperation({ summary: 'Get price for specific asset' })
  async getPrice(@Param('asset') asset: string) {
    const price = await this.priceService.getPrice(asset);
    return okResponse(price);
  }
}
