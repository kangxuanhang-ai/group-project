export interface User {
  id: string; // 用户ID
  name: string; // 用户名
  email?: string | null; // 邮箱
  phone: string; // 手机号
  address?: string | null; // 地址
  password: string; // 密码
  avatar?: string | null; // 头像
  wordNumber: number; // 单词数量
  dayNumber: number; // 打卡天数
  createdAt: Date; // 创建时间，ISO字符串或Date
  updatedAt: Date; // 更新时间，ISO字符串或Date
  lastLoginAt?: Date | null; // 最后登录时间，ISO字符串或Date
}

export type UserRegister = Pick<User, "name" | "phone" | "email" | "password">;

export type UserLogin = Pick<User, "phone" | "password">;

export type ResultUser = Omit<User, "password">;

export type Token = {
  accessToken: string; // 访问令牌
  refreshToken: string; // 刷新令牌
};

export type WebResultUser = ResultUser & {
  token: Token;
};
