import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { okResponse } from '../../common/utils/ok-response.util';

@ApiTags('Positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get(':address')
  @ApiOperation({ summary: 'Get user all positions' })
  async getUserPositions(@Param('address') address: string) {
    const summary = await this.positionsService.getPositionsSummary(address);
    return okResponse(summary);
  }

  @Get(':address/health')
  @ApiOperation({ summary: 'Get user health factor' })
  async getHealthFactor(@Param('address') address: string) {
    const healthFactor = await this.positionsService.getHealthFactor(address);
    return okResponse({ healthFactor });
  }

  @Get(':address/account-data')
  @ApiOperation({ summary: 'Get user account data (aggregated)' })
  async getAccountData(@Param('address') address: string) {
    const accountData = await this.positionsService.getAccountData(address);
    return okResponse(accountData);
  }
}
