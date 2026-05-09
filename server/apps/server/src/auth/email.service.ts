import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import * as nodemailer from 'nodemailer';

const EMAIL_COOLDOWN_MS = 60_000;
const EMAIL_DAILY_LIMIT = 30;
const EMAIL_MAX_ATTEMPTS = 10;
const EMAIL_CODE_EXPIRY_MINUTES = 5;

function todayStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

@Injectable()
export class EmailService {
    private cooldownMap = new Map<string, number>();
    private transporter: nodemailer.Transporter;

    constructor(private readonly prisma: PrismaService) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendCode(email: string) {
        const now = Date.now();
        const lastSent = this.cooldownMap.get(email);
        if (lastSent && now - lastSent < EMAIL_COOLDOWN_MS) {
            const remaining = Math.ceil((EMAIL_COOLDOWN_MS - (now - lastSent)) / 1000);
            return { success: false, message: `请 ${remaining} 秒后再试`, remaining };
        }

        const todayCount = await this.prisma.emailCode.count({
            where: { email, createdAt: { gte: todayStart() } },
        });
        if (todayCount >= EMAIL_DAILY_LIMIT) {
            return { success: false, message: '该邮箱今日验证码发送次数已达上限' };
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));

        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Open English 邮箱验证码',
                text: `您的验证码是：${code}，有效期 ${EMAIL_CODE_EXPIRY_MINUTES} 分钟，请勿泄露给他人。`,
                html: `<div style="font-family:Arial,sans-serif;padding:20px;">
                    <h2>Open English 验证码</h2>
                    <p>您的验证码是：<strong style="font-size:24px;color:#4F46E5;">${code}</strong></p>
                    <p>有效期 ${EMAIL_CODE_EXPIRY_MINUTES} 分钟，请勿泄露给他人。</p>
                </div>`,
            });
        } catch (err: any) {
            return { success: false, message: `邮件发送异常: ${err.message}` };
        }

        await this.prisma.emailCode.create({
            data: {
                email,
                code,
                expiresAt: new Date(Date.now() + EMAIL_CODE_EXPIRY_MINUTES * 60 * 1000),
            },
        });

        this.cooldownMap.set(email, now);
        return { success: true, message: '验证码已发送至您的邮箱' };
    }

    async verifyCode(email: string, code: string) {
        const record = await this.prisma.emailCode.findFirst({
            where: { email, code, used: false, expiresAt: { gte: new Date() } },
            orderBy: { createdAt: 'desc' },
        });

        if (!record) {
            const latest = await this.prisma.emailCode.findFirst({
                where: { email, used: false, expiresAt: { gte: new Date() } },
                orderBy: { createdAt: 'desc' },
            });

            if (latest) {
                const newAttempts = latest.attempts + 1;
                const updateData: any = { attempts: newAttempts };
                if (newAttempts >= EMAIL_MAX_ATTEMPTS) {
                    updateData.used = true;
                }
                await this.prisma.emailCode.update({
                    where: { id: latest.id },
                    data: updateData,
                });
            }

            return { success: false, message: '验证码错误或已过期' };
        }

        await this.prisma.emailCode.update({
            where: { id: record.id },
            data: { used: true },
        });

        return { success: true, message: '验证码校验通过' };
    }
}
