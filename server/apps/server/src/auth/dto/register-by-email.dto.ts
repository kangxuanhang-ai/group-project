import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator'

export class RegisterByEmailDto {
    @IsString()
    @MinLength(2)
    @MaxLength(10)
    name: string

    @Matches(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, { message: '请输入正确的邮箱格式' })
    email: string

    @IsString()
    @MinLength(6)
    @MaxLength(16)
    password: string

    @IsString()
    @Matches(/^\d{6}$/, { message: '验证码为6位数字' })
    code: string

    @IsOptional()
    @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })
    phone?: string
}
