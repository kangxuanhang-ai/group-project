import { Matches } from 'class-validator';

export class SendEmailCodeDto {
    @Matches(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, { message: '请输入正确的邮箱格式' })
    email: string;
}
