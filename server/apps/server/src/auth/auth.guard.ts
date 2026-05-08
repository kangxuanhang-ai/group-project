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
            const decoded = this.jwtService.verify<{ tokenType: string }>(token)
            if (decoded.tokenType !== 'access') {
                throw new UnauthorizedException('无效的访问令牌')
            }
            request.user = decoded
            return true
        } catch (err) {
            if (err instanceof UnauthorizedException) throw err
            throw new UnauthorizedException('token已过期或无效')
        }
    }
}
