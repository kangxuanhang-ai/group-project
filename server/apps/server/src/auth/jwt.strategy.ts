import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { RefreshTokenPayload } from '@en/common/user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'open-english-app-secret',
        });
    }

    async validate(payload: RefreshTokenPayload) {
        if (payload.tokenType !== 'access') {
            throw new UnauthorizedException('无效的访问令牌');
        }
        return { userId: payload.userId, name: payload.name, email: payload.email };
    }
}
