import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BindEmailDto } from './dto/bind-email.dto';
import { BindPhoneDto } from './dto/bind-phone.dto';
import { PrismaService } from '@libs/shared';
import { ResponseService } from '@libs/shared';
import { MinioService } from '@libs/shared/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../auth/email.service';
import { SmsService } from '../auth/sms.service';
import type {UserUpdate} from '@en/common/user'
import type {Request} from 'express';
import {updateUserSelect} from './user.select';
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    const test = await this.prisma.user.findMany();
    return this.response.success(test);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  // 用户头像上传
  async uploadAvatar(file: Express.Multer.File) {
    if (!file) {
      return this.response.error(null,'文件不能为空');
    }
    if(file.size>1024*1024*5){
      return this.response.error(null,'文件大小不能超过5MB');
    }
    const client = this.minioService.getClient();
    const bucket = this.minioService.getBucket(); 

    if (!client) {
      return this.response.error(null, 'MinIO client not available');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    await client.putObject(bucket, fileName, file.buffer, file.size, {
      "Content-Type": file.mimetype,
    });
    //返回文件url
    const isHttps=!!Number(this.configService.get('MINIO_USE_SSL'));
    const baseUrl = isHttps ? 'https' : 'http';
    const port = this.configService.get('MINIO_PORT')!;
    const databaseUrl=`/${bucket}/${fileName}`
    const previewUrl=`${baseUrl}://${this.configService.get('MINIO_ENDPOINT')}:${port}${databaseUrl}`
    return this.response.success({
      previewUrl,
      databaseUrl
    });
  }
  // 更新用户
  async updateUser(createUserDto: UserUpdate,user:Request['user']) {
    const updateUser =await this.prisma.user.update({
      where: {
        id: user.userId
      },
      data: {
        name: createUserDto.name,
        avatar: createUserDto.avatar,
        email: createUserDto.email,
        address: createUserDto.address,
        bio: createUserDto.bio,
        isTimingTask: createUserDto.isTimingTask,
        timingTaskTime: createUserDto.timingTaskTime,
      },
      select: updateUserSelect,
    });
    return this.response.success(updateUser);
  }

  async bindEmail(dto: BindEmailDto, user: Request['user']) {
    const verifyResult = await this.emailService.verifyCode(dto.email, dto.code);
    if (!verifyResult.success) {
      return this.response.error(null, verifyResult.message, 400);
    }

    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) return this.response.error(null, '该邮箱已被其他账号绑定', 400);

    const updated = await this.prisma.user.update({
      where: { id: user.userId },
      data: { email: dto.email },
      select: updateUserSelect,
    });
    return this.response.success(updated);
  }

  async bindPhone(dto: BindPhoneDto, user: Request['user']) {
    const verifyResult = await this.smsService.verifyCode(dto.phone, dto.code);
    if (!verifyResult.success) {
      return this.response.error(null, verifyResult.message, 400);
    }

    const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existingPhone) return this.response.error(null, '该手机号已被其他账号绑定', 400);

    const updated = await this.prisma.user.update({
      where: { id: user.userId },
      data: { phone: dto.phone },
      select: updateUserSelect,
    });
    return this.response.success(updated);
  }

  async checkIn(user: Request['user']) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.checkIn.findUnique({
      where: { userId_date: { userId: user.userId, date: today } },
    });
    if (existing) {
      return this.response.error(null, '今日已打卡', 400);
    }

    await this.prisma.checkIn.create({
      data: { userId: user.userId, date: today },
    });

    const count = await this.prisma.checkIn.count({ where: { userId: user.userId } });
    await this.prisma.user.update({
      where: { id: user.userId },
      data: { dayNumber: count },
    });

    return this.response.success({ dayNumber: count, checked: true });
  }

  async todayCheckIn(user: Request['user']) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.checkIn.findUnique({
      where: { userId_date: { userId: user.userId, date: today } },
    });

    return this.response.success({ checked: !!existing });
  }
}
