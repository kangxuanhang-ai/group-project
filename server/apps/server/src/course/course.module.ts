import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '@libs/shared';

@Module({
  imports: [AuthModule, SharedModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
