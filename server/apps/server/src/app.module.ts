import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SharedModule } from '@libs/shared';
import { WordBookModule } from './word-book/word-book.module';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { MulterModule } from '@nestjs/platform-express'; // 新增
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 关键：全局注册，不用每个模块都导入
      envFilePath: '.env', // 可选：指定 .env 文件路径，默认就是根目录的 .env
    }),
     MulterModule.register({
      dest: './uploads', // 临时文件存储目录，MinIO 上传后可以删除
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    UserModule, SharedModule, WordBookModule, AuthModule, CourseModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}