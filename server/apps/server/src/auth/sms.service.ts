import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import Dysmsapi, { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import * as OpenApi from '@alicloud/openapi-client';

const SMS_COOLDOWN_MS = 60_000;
const SMS_DAILY_LIMIT = 30;
const SMS_MAX_ATTEMPTS = 10;
const SMS_CODE_EXPIRY_MINUTES = 5;

function todayStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

@Injectable()
export class SmsService {
    private cooldownMap = new Map<string, number>();
    private client: Dysmsapi;

    constructor(private readonly prisma: PrismaService) {
        const config = new OpenApi.Config({
            accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
            accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
        });
        config.endpoint = 'dysmsapi.aliyuncs.com';
        this.client = new Dysmsapi(config);
    }

    async sendCode(phone: string) {
        const now = Date.now();
        const lastSent = this.cooldownMap.get(phone);
        if (lastSent && now - lastSent < SMS_COOLDOWN_MS) {
            const remaining = Math.ceil((SMS_COOLDOWN_MS - (now - lastSent)) / 1000);
            return { success: false, message: `请 ${remaining} 秒后再试`, remaining };
        }

        const todayCount = await this.prisma.smsCode.count({
            where: { phone, createdAt: { gte: todayStart() } },
        });
        if (todayCount >= SMS_DAILY_LIMIT) {
            return { success: false, message: '该手机号今日验证码发送次数已达上限' };
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));

        try {
            const sendReq = new SendSmsRequest({
                phoneNumbers: phone,
                signName: process.env.ALIYUN_SMS_SIGN_NAME,
                templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
                templateParam: JSON.stringify({ code }),
            });

            const resp = await this.client.sendSms(sendReq);
            if (resp.body?.code !== 'OK') {
                return { success: false, message: `短信发送失败: ${resp.body?.message || '未知错误'}` };
            }
        } catch (err: any) {
            return { success: false, message: `短信发送异常: ${err.message}` };
        }

        await this.prisma.smsCode.create({
            data: {
                phone,
                code,
                expiresAt: new Date(Date.now() + SMS_CODE_EXPIRY_MINUTES * 60 * 1000),
            },
        });

        this.cooldownMap.set(phone, now);
        return { success: true, message: '验证码已发送' };
    }

    async verifyCode(phone: string, code: string) {
        const record = await this.prisma.smsCode.findFirst({
            where: { phone, code, used: false, expiresAt: { gte: new Date() } },
            orderBy: { createdAt: 'desc' },
        });

        if (!record) {
            const latest = await this.prisma.smsCode.findFirst({
                where: { phone, used: false, expiresAt: { gte: new Date() } },
                orderBy: { createdAt: 'desc' },
            });

            if (latest) {
                const newAttempts = latest.attempts + 1;
                const updateData: any = { attempts: newAttempts };
                if (newAttempts >= SMS_MAX_ATTEMPTS) {
                    updateData.used = true;
                }
                await this.prisma.smsCode.update({
                    where: { id: latest.id },
                    data: updateData,
                });
            }

            return { success: false, message: '验证码错误或已过期' };
        }

        await this.prisma.smsCode.update({
            where: { id: record.id },
            data: { used: true },
        });

        return { success: true, message: '验证码校验通过' };
    }
}
