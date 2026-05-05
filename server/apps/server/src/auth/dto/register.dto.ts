import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator'

export class RegisterDto {
    @IsString()
    @MinLength(2)
    @MaxLength(10)
    name: string

    @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })
    phone: string

    @IsOptional()
    @Matches(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, { message: '请输入正确的邮箱格式' })
    email?: string

    @IsString()
    @MinLength(6)
    @MaxLength(16)
    password: string
}
