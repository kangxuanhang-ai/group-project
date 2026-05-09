import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@libs/shared';
import { ResponseService } from '@libs/shared';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterByEmailDto } from './dto/register-by-email.dto';
import { LoginDto } from './dto/login.dto';
import type { TokenPayload, RefreshTokenPayload } from '@en/common/user';
import type { Token } from '@en/common/user';

function isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly response: ResponseService,
        private readonly smsService: SmsService,
        private readonly emailService: EmailService,
    ) { }

    async sendCode(phone: string) {
        return this.smsService.sendCode(phone);
    }

    async sendEmailCode(email: string) {
        return this.emailService.sendCode(email);
    }

    async register(dto: RegisterDto) {
        const verifyResult = await this.smsService.verifyCode(dto.phone, dto.code);
        if (!verifyResult.success) {
            return this.response.error(null, verifyResult.message, 400);
        }

        const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } })
        if (existingPhone) return this.response.error(null, '该手机号已注册', 400)

        if (dto.email) {
            const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } })
            if (existingEmail) return this.response.error(null, '该邮箱已注册', 400)
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                phone: dto.phone,
                email: dto.email,
                password: hashedPassword,
            },
        })

        const token = this.generateToken(user)
        const { password, ...result } = user
        return this.response.success({ ...result, token })
    }

    async registerByEmail(dto: RegisterByEmailDto) {
        const verifyResult = await this.emailService.verifyCode(dto.email, dto.code);
        if (!verifyResult.success) {
            return this.response.error(null, verifyResult.message, 400);
        }

        const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } })
        if (existingEmail) return this.response.error(null, '该邮箱已注册', 400)

        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
            },
        })

        const token = this.generateToken(user)
        const { password, ...result } = user
        return this.response.success({ ...result, token })
    }

    async login(dto: LoginDto) {
        const email = isEmail(dto.account)
        const user = email
            ? await this.prisma.user.findUnique({ where: { email: dto.account } })
            : await this.prisma.user.findUnique({ where: { phone: dto.account } })

        if (!user) return this.response.error(null, '账号或密码错误', 401)

        const isValid = await bcrypt.compare(dto.password, user.password)
        if (!isValid) return this.response.error(null, '账号或密码错误', 401)

        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        })

        const token = this.generateToken(user)
        const { password, ...result } = user
        return this.response.success({ ...result, token })
    }

    async refreshToken(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify<RefreshTokenPayload>(refreshToken)
            if (decoded.tokenType !== 'refresh') {
                return this.response.error(null, 'refreshToken已过期或无效', 401)
            }

            const user = await this.prisma.user.findUnique({ where: { id: decoded.userId } })
            if (!user) return this.response.error(null, '用户不存在', 401)

            const token = this.generateToken(user)
            return this.response.success(token)
        } catch {
            return this.response.error(null, 'refreshToken已过期或无效', 401)
        }
    }

    private generateToken(user: { id: string; name: string; email?: string | null }): Token {
        const payload: TokenPayload = { userId: user.id, name: user.name, email: user.email }
        return {
            accessToken: this.jwtService.sign<RefreshTokenPayload>(
                { ...payload, tokenType: 'access' },
                { expiresIn: '30m' },
            ),
            refreshToken: this.jwtService.sign<RefreshTokenPayload>(
                { ...payload, tokenType: 'refresh' },
                { expiresIn: '7d' },
            ),
        }
    }
}
