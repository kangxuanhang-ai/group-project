import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PayService } from './pay.service';
import { PayController } from './pay.controller';
import { PayGateway } from './pay.gateway';
import { AuthGuard } from '../../../../apps/server/src/auth/auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'open-english-app-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [PayController],
  providers: [PayService, AuthGuard, PayGateway],
  exports: [PayService, PayGateway],
})
export class PayModule {}
