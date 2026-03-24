import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LiquidationService } from './liquidation.service';
import { okResponse } from '../../common/utils/ok-response.util';

@ApiTags('Liquidations')
@Controller('liquidations')
export class LiquidationController {
  constructor(private readonly liquidationService: LiquidationService) {}

  @Get('available')
  @ApiOperation({ summary: 'Get liquidatable positions' })
  async getLiquidatablePositions() {
    const positions = await this.liquidationService.findLiquidatablePositions();
    return okResponse(positions);
  }

  @Get(':address/check')
  @ApiOperation({ summary: 'Check if user position is liquidatable' })
  async checkLiquidatable(@Param('address') address: string) {
    const result = await this.liquidationService.isLiquidatable(address);
    return okResponse(result);
  }

  @Post('preview')
  @ApiOperation({ summary: 'Preview liquidation' })
  async previewLiquidation(
    @Body() dto: {
      borrowerAddr: string;
      debtAsset: string;
      collAsset: string;
      repayAmount: string;
    },
  ) {
    const preview = await this.liquidationService.previewLiquidation(
      dto.borrowerAddr,
      dto.debtAsset,
      dto.collAsset,
      dto.repayAmount,
    );
    return okResponse(preview);
  }
}
