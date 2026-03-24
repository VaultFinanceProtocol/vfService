import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HistoryService, OperationStatus } from './history.service';
import { okResponse } from '../../common/utils/ok-response.util';

@ApiTags('History')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get operation history' })
  @ApiQuery({ name: 'address', required: true })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: OperationStatus })
  async getHistory(
    @Query('address') address: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OperationStatus,
  ) {
    if (!address) {
      return okResponse({ records: [], meta: { total: 0, offset: 0, limit: 20 } });
    }

    const result = await this.historyService.getUserHistory(address, {
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
    });

    return okResponse({
      records: result.records,
      meta: {
        total: result.total,
        offset: offset ? parseInt(offset, 10) : 0,
        limit: limit ? parseInt(limit, 10) : 20,
        hasMore: (offset ? parseInt(offset, 10) : 0) + (limit ? parseInt(limit, 10) : 20) < result.total,
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get operation details' })
  async getOperation(@Param('id') id: string) {
    const operation = await this.historyService.getOperation(id);
    return okResponse(operation);
  }
}
