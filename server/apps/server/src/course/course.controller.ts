import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('list')
  findAll() {
    return this.courseService.findAll();
  }

  @Get('my')
  @UseGuards(AuthGuard)
  findMyCourses(@Req() req: any) {
    return this.courseService.findMyCourses(req.user.userId);
  }
}