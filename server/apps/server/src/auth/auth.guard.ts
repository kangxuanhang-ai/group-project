import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers.authorization

        if (!authHeader) {
            throw new UnauthorizedException('请先登录')
        }

        const token = authHeader.split(' ')[1]
        if (!token) {
            throw new UnauthorizedException('请先登录')
        }

        try {
            const decoded = this.jwtService.verify(token)
            request.user = decoded
            return true
        } catch {
            throw new UnauthorizedException('token已过期或无效')
        }
    }
}
