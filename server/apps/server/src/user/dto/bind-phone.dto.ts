import { Matches } from 'class-validator'

export class BindPhoneDto {
    @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号格式' })
    phone: string

    @Matches(/^\d{6}$/, { message: '验证码为6位数字' })
    code: string
}
