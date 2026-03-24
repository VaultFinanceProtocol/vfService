import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VaultService } from './vault.service';
import { okResponse } from '../../common/utils/ok-response.util';

@ApiTags('Vault')
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get vault configuration' })
  async getVaultConfig() {
    const config = this.vaultService.getVaultConfig();
    return okResponse(config);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get protocol statistics' })
  async getProtocolStats() {
    const stats = await this.vaultService.getProtocolStats();
    return okResponse(stats);
  }
}
