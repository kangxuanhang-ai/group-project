import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common'
import { PayService } from './pay.service'
import { CreatePayDto, QueryPayStatusDto, PayResponse, QueryPayStatusResponse } from './pay.dto'
import { AuthGuard } from '../../../../apps/server/src/auth/auth.guard'

@Controller('pay')
export class PayController {
  constructor(private readonly payService: PayService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async createPay(@Body() createPayDto: CreatePayDto, @Req() req: any): Promise<PayResponse> {
    return this.payService.createPay(createPayDto, req.user.userId)
  }

  @Get('query/:orderId')
  async queryPayStatus(@Param() queryPayDto: QueryPayStatusDto) {
    return this.payService.queryPayStatus(queryPayDto.orderId)
  }

  @Post('notify')
  async payNotify(@Body() body: any) {
    const outTradeNo = body.out_trade_no
    if (outTradeNo) {
      return this.payService.queryPayStatus(outTradeNo)
    }
    return { code: 200, data: { message: 'success' } }
  }

  @Post('confirm')
  @UseGuards(AuthGuard)
  async confirmPay(@Body('orderId') orderId: string) {
    return this.payService.confirmPay(orderId)
  }
}