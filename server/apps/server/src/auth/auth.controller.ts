import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterByEmailDto } from './dto/register-by-email.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { SendEmailCodeDto } from './dto/send-email-code.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('send-code')
    sendCode(@Body() dto: SendCodeDto) {
        return this.authService.sendCode(dto.phone);
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('send-email-code')
    sendEmailCode(@Body() dto: SendEmailCodeDto) {
        return this.authService.sendEmailCode(dto.email);
    }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('register-by-email')
    registerByEmail(@Body() dto: RegisterByEmailDto) {
        return this.authService.registerByEmail(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    refresh(@Body() dto: RefreshDto) {
        return this.authService.refreshToken(dto.refreshToken);
    }
}
