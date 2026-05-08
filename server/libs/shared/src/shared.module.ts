import { Module,Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';
import { MinioModule } from './minio/minio.module';
@Global()
@Module({
  providers: [SharedService],
  exports: [SharedService,PrismaModule,ResponseModule,MinioModule],
  imports: [PrismaModule,ResponseModule, MinioModule],
})
export class SharedModule {}
