import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SharedModule } from '@libs/shared';
import { WordBookModule } from './word-book/word-book.module';
import { CourseModule } from './course/course.module';
@Module({
  imports: [UserModule, SharedModule, WordBookModule, CourseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
