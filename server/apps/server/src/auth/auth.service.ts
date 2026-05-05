import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@libs/shared';
import { ResponseService } from '@libs/shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly response: ResponseService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } })
        if (existing) return this.response.error(null, '该手机号已注册', 400)

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

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } })
        if (!user) return this.response.error(null, '手机号或密码错误', 401)

        const isValid = await bcrypt.compare(dto.password, user.password)
        if (!isValid) return this.response.error(null, '手机号或密码错误', 401)

        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        })

        const token = this.generateToken(user)
        const { password, ...result } = user
        return this.response.success({ ...result, token })
    }

    private generateToken(user: { id: string; phone: string }) {
        const payload = { sub: user.id, phone: user.phone }
        return {
            accessToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
        }
    }
}
