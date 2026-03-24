import { Controller, Get, Post, Body, Param, Patch, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBasicAuth } from '@nestjs/swagger';
import { AdminService, AddPoolRequest } from './admin.service';
import { okResponse } from '../../common/utils/ok-response.util';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pools')
  @ApiOperation({ summary: 'List all pools (admin view)' })
  async listPools() {
    const pools = await this.adminService.listPools();
    return okResponse(pools);
  }

  @Post('pools')
  @ApiOperation({ summary: 'Add new pool' })
  async addPool(@Body() dto: AddPoolRequest) {
    const pool = await this.adminService.addPool(dto);
    return okResponse(pool);
  }

  @Get('pools/:asset/config')
  @ApiOperation({ summary: 'Get pool config' })
  async getPoolConfig(@Param('asset') asset: string) {
    const config = await this.adminService.getPoolConfig(asset);
    return okResponse(config);
  }

  @Patch('pools/:asset/pause')
  @ApiOperation({ summary: 'Pause/unpause pool' })
  async pausePool(
    @Param('asset') asset: string,
    @Body('paused') paused: boolean,
  ) {
    const pool = await this.adminService.setPoolPaused(asset, paused);
    return okResponse(pool);
  }
}
