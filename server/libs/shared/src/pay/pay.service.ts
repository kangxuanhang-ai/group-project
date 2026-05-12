import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { AlipaySdk } from 'alipay-sdk';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayDto, PayResponse } from './pay.dto';
import { PayGateway } from './pay.gateway';

@Injectable()
export class PayService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly payGateway: PayGateway,
  ) {}
  public alipaySdk: AlipaySdk;

  onModuleInit(): void {
    try {
      this.alipaySdk = new AlipaySdk({
        appId: this.configService.get<string>('ALIPAY_APP_ID') || '',
        privateKey: this.configService.get<string>('ALIPAY_PRIVATE_KEY') || '',
        alipayPublicKey:
          this.configService.get<string>('ALIPAY_PUBLIC_KEY') || '',
        gateway: this.configService.get<string>('ALIPAY_GATEWAY') || '',
      });
    } catch (error) {
      console.warn('Alipay SDK initialization failed:', error);
    }
  }

  getAlipaySdk(): AlipaySdk {
    return this.alipaySdk;
  }

  async createPay(
    createPayDto: CreatePayDto,
    userId: string,
  ): Promise<PayResponse> {
    // 检查是否已购买
    const existing = await this.prisma.courseRecord.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: createPayDto.courseId,
        },
      },
    });
    if (existing?.isPurchased) {
      throw new BadRequestException('您已购买过该课程');
    }

    // 创建支付订单
    const order = await this.prisma.paymentRecord.create({
      data: {
        courseId: createPayDto.courseId,
        outTradeNo: `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        subject: createPayDto.subject,
        body: createPayDto.body,
        amount: createPayDto.total_amount,
        tradeStatus: 'NOT_PAY',
        userId,
      },
    });

    // 生成支付宝订单参数
    const orderParams = {
      bizContent: {
        outTradeNo: order.id,
        productCode: 'FAST_INSTANT_TRADE_PAY',
        totalAmount: createPayDto.total_amount,
        subject: createPayDto.subject,
        body: createPayDto.body,
        timeoutExpress: '30m',
      },
      returnUrl: `${this.configService.get<string>('CLIENT_URL') || 'http://localhost:8080'}/courses/index`,
      notifyUrl: this.configService.get<string>('ALIPAY_NOTIFY_URL'),
    };

    // 创建支付宝支付请求
    const result = await this.alipaySdk.pageExec(
      'alipay.trade.page.pay',
      orderParams,
    );

    // 更新订单的支付宝交易号
    await this.prisma.paymentRecord.update({
      where: { id: order.id },
      data: {
        outTradeNo: order.id,
      },
    });

    return {
      code: 200,
      data: {
        payUrl: result,
        timeExpire: Date.now() + 30 * 60 * 1000,
        orderId: order.id,
      },
    };
  }

  async queryPayStatus(orderId: string) {
    const order = await this.prisma.paymentRecord.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    // 如果订单已经有状态，直接返回
    if (order.tradeStatus !== 'NOT_PAY') {
      return {
        code: 200,
        data: {
          status: order.tradeStatus,
          message: '订单已完成或已关闭',
        },
      };
    }

    // 查询支付宝订单状态
    const result = await this.alipaySdk.exec('alipay.trade.query', {
      bizContent: {
        outTradeNo: orderId,
      },
    });

    // 解析查询结果，获取交易状态
    const response = (result as any).data || result;
    const alipayStatus =
      response.alipay_trade_query_response?.trade_status || '';

    // 更新本地订单状态
    let status: 'NOT_PAY' | 'TRADE_SUCCESS' | 'TRADE_CLOSED' = 'NOT_PAY';
    let message = '支付处理中';

    if (alipayStatus === 'TRADE_SUCCESS') {
      status = 'TRADE_SUCCESS';
      message = '支付成功';

      // 更新课程购买记录
      if (order.courseId) {
        await this.prisma.courseRecord.upsert({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: order.courseId,
            },
          },
          create: {
            userId: order.userId,
            courseId: order.courseId,
            paymentRecordId: order.id,
            isPurchased: true,
          },
          update: {
            paymentRecordId: order.id,
            isPurchased: true,
          },
        });
      }

      // 通过 WebSocket 推送支付成功通知
      this.payGateway.notifyPaymentResult(order.userId, true);
    } else if (alipayStatus === 'TRADE_CLOSED') {
      status = 'TRADE_CLOSED';
      message = '支付已关闭';

      // 通过 WebSocket 推送支付失败通知
      this.payGateway.notifyPaymentResult(order.userId, false);
    }

    await this.prisma.paymentRecord.update({
      where: { id: orderId },
      data: { tradeStatus: status as any },
    });

    return {
      code: 200,
      data: {
        status,
        message,
        alipayStatus,
      },
    };
  }

  async confirmPay(orderId: string) {
    const order = await this.prisma.paymentRecord.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (
      order.tradeStatus === 'TRADE_SUCCESS' ||
      order.tradeStatus === 'TRADE_FINISHED'
    ) {
      return {
        code: 200,
        data: { status: order.tradeStatus, message: '支付已确认' },
      };
    }

    await this.prisma.paymentRecord.update({
      where: { id: orderId },
      data: { tradeStatus: 'TRADE_SUCCESS' as any },
    });

    if (order.courseId) {
      await this.prisma.courseRecord.upsert({
        where: {
          userId_courseId: {
            userId: order.userId,
            courseId: order.courseId,
          },
        },
        create: {
          userId: order.userId,
          courseId: order.courseId,
          paymentRecordId: order.id,
          isPurchased: true,
        },
        update: {
          paymentRecordId: order.id,
          isPurchased: true,
        },
      });
    }

    this.payGateway.notifyPaymentResult(order.userId, true);

    return {
      code: 200,
      data: { status: 'TRADE_SUCCESS', message: '支付成功' },
    };
  }
}
