export interface User {
  id: string; // 用户ID
  name: string; // 用户名
  email?: string | null; // 邮箱
  phone: string; // 手机号
  address?: string | null; // 地址
  password: string; // 密码
  avatar?: string | null; // 头像
  bio?: string | null; // 签名 第七集新增字段
  isTimingTask: boolean; // 是否开启定时任务 第七集新增字段
  timingTaskTime: string; // 定时任务时间 第七集新增字段
  wordNumber: number; // 单词数量
  dayNumber: number; // 打卡天数
  createdAt: Date; // 创建时间，ISO字符串或Date
  updatedAt: Date; // 更新时间，ISO字符串或Date
  lastLoginAt?: Date | null; // 最后登录时间，ISO字符串或Date
}

export type UserRegister = Pick<User, "name" | "phone" | "email" | "password">;

export type UserLogin = Pick<User, "phone" | "password">;

export type ResultUser = Omit<User, "password">;

export type UserUpdate = Pick<User, 'name' | 'email' | 'address' | 'bio' | 'isTimingTask' | 'timingTaskTime' | 'avatar'>
//头像返回的类型
export type AvatarResult = {
    previewUrl: string; // 预览URL
    databaseUrl: string; // 数据库URL
}

export type Token = {
  accessToken: string; // 访问令牌
  refreshToken: string; // 刷新令牌
};

export type WebResultUser = ResultUser & {
  token: Token;
};

export type TokenPayload = Pick<User, "name" | "email"> & {
  userId: User["id"];
};

export type RefreshTokenPayload = TokenPayload & {
  tokenType: "access" | "refresh";
};
