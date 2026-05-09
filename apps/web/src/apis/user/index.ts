import { serverApi, type Response } from "..";
import type { UserLogin, UserRegister, UserRegisterByEmail, WebResultUser, Token, AvatarResult, UserUpdate, User } from "@en/common/user";

export const loginApi = (data: UserLogin): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/login', data) as Promise<Response<WebResultUser>>
}

export const registerApi = (data: UserRegister & { code: string }): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/register', data) as Promise<Response<WebResultUser>>
}

export const registerByEmailApi = (data: UserRegisterByEmail & { code: string }): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/register-by-email', data) as Promise<Response<WebResultUser>>
}

export const refreshTokenApi = (data: { refreshToken: string }): Promise<Response<Token>> => {
    return serverApi.post('/auth/refresh', data) as Promise<Response<Token>>
}
//上传头像
export const uploadAvatarApi = (file: FormData) => serverApi.post('/user/upload-avatar', file) as Promise<Response<AvatarResult>>
//更新用户
export const updateUser = (data: UserUpdate) => serverApi.post('/user/update-user', data) as Promise<Response<UserUpdate>>

export const sendCodeApi = (phone: string): Promise<Response<null>> => {
    return serverApi.post('/auth/send-code', { phone }) as Promise<Response<null>>
}

export const sendEmailCodeApi = (email: string): Promise<Response<null>> => {
    return serverApi.post('/auth/send-email-code', { email }) as Promise<Response<null>>
}

export const bindEmailApi = (data: { email: string; code: string }): Promise<Response<UserUpdate>> => {
    return serverApi.post('/user/bind-email', data) as Promise<Response<UserUpdate>>
}
