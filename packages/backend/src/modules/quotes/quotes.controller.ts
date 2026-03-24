import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuotesService, SupplyQuoteRequest, WithdrawQuoteRequest, BorrowQuoteRequest, RepayQuoteRequest } from './quotes.service';
import { okResponse } from '../../common/utils/ok-response.util';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('supply')
  @ApiOperation({ summary: 'Get supply quote' })
  async getSupplyQuote(@Body() request: SupplyQuoteRequest) {
    const quote = await this.quotesService.getSupplyQuote(request);
    return okResponse(quote);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Get withdraw quote' })
  async getWithdrawQuote(@Body() request: WithdrawQuoteRequest) {
    const quote = await this.quotesService.getWithdrawQuote(request);
    return okResponse(quote);
  }

  @Post('borrow')
  @ApiOperation({ summary: 'Get borrow quote' })
  async getBorrowQuote(@Body() request: BorrowQuoteRequest) {
    const quote = await this.quotesService.getBorrowQuote(request);
    return okResponse(quote);
  }

  @Post('repay')
  @ApiOperation({ summary: 'Get repay quote' })
  async getRepayQuote(@Body() request: RepayQuoteRequest) {
    const quote = await this.quotesService.getRepayQuote(request);
    return okResponse(quote);
  }
}
