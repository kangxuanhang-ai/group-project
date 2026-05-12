import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EmailService } from '../auth/email.service';
import { SmsService } from '../auth/sms.service';

@Module({
  controllers: [UserController],
  providers: [UserService, EmailService, SmsService],
})
export class UserModule {}
