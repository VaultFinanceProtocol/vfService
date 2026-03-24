import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransactionsService, SupplyTxRequest, WithdrawTxRequest, BorrowTxRequest, RepayTxRequest } from './transactions.service';
import { ExecutionService } from '../execution/execution.service';
import { okResponse } from '../../common/utils/ok-response.util';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly executionService: ExecutionService,
  ) {}

  @Post('supply/draft')
  @ApiOperation({ summary: 'Create supply transaction draft' })
  async createSupplyDraft(@Body() request: SupplyTxRequest) {
    const draft = await this.transactionsService.createSupplyDraft(request);
    return okResponse(draft);
  }

  @Post('withdraw/draft')
  @ApiOperation({ summary: 'Create withdraw transaction draft' })
  async createWithdrawDraft(@Body() request: WithdrawTxRequest) {
    const draft = await this.transactionsService.createWithdrawDraft(request);
    return okResponse(draft);
  }

  @Post('borrow/draft')
  @ApiOperation({ summary: 'Create borrow transaction draft' })
  async createBorrowDraft(@Body() request: BorrowTxRequest) {
    const draft = await this.transactionsService.createBorrowDraft(request);
    return okResponse(draft);
  }

  @Post('repay/draft')
  @ApiOperation({ summary: 'Create repay transaction draft' })
  async createRepayDraft(@Body() request: RepayTxRequest) {
    const draft = await this.transactionsService.createRepayDraft(request);
    return okResponse(draft);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast signed transaction' })
  async broadcast(@Body() dto: {
    signedTx: string;
    operation: string;
    userAddr: string;
    asset: string;
    amount: string;
  }) {
    const result = await this.executionService.broadcast(dto.signedTx, {
      operation: dto.operation,
      userAddr: dto.userAddr,
      asset: dto.asset,
      amount: dto.amount,
    });
    return okResponse(result);
  }

  @Get(':txid')
  @ApiOperation({ summary: 'Get transaction status' })
  async getTransaction(@Param('txid') txid: string) {
    const tx = await this.executionService.getTransaction(txid);
    return okResponse(tx);
  }
}
