import { Module,Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';
import { PayModule } from './pay/pay.module';
@Global()
@Module({
  providers: [SharedService],
  exports: [SharedService,PrismaModule,ResponseModule, PayModule],
  imports: [PrismaModule,ResponseModule, PayModule],
})
export class SharedModule {}
