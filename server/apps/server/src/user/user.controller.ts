import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BindEmailDto } from './dto/bind-email.dto';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type {UserUpdate} from '@en/common/user'
import { AuthGuard } from '@nestjs/passport';
import type {Request} from 'express';
import { Multer } from 'multer'; // 直接导入类型
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  //上传用户头像
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadAvatar(file);
  }

  //更新用户
  @UseGuards(AuthGuard('jwt'))  
  @Post('update-user')
  updateUser(@Body() createUserDto: UserUpdate , @Req() req: Request) {
    const user = req.user;
    return this.userService.updateUser(createUserDto,user);
  }

  //绑定邮箱
  @UseGuards(AuthGuard('jwt'))
  @Post('bind-email')
  bindEmail(@Body() dto: BindEmailDto, @Req() req: Request) {
    const user = req.user;
    return this.userService.bindEmail(dto, user);
  }

  //绑定手机号
  @UseGuards(AuthGuard('jwt'))
  @Post('bind-phone')
  bindPhone(@Body() dto: BindPhoneDto, @Req() req: Request) {
    const user = req.user;
    return this.userService.bindPhone(dto, user);
  }

  //打卡
  @UseGuards(AuthGuard('jwt'))
  @Post('check-in')
  checkIn(@Req() req: Request) {
    return this.userService.checkIn(req.user);
  }

  //今日打卡状态
  @UseGuards(AuthGuard('jwt'))
  @Get('check-in/today')
  todayCheckIn(@Req() req: Request) {
    return this.userService.todayCheckIn(req.user);
  }
}
