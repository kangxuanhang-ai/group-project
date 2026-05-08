import { serverApi, type Response } from "..";
import type { UserLogin, UserRegister, WebResultUser, Token, AvatarResult, UserUpdate } from "@en/common/user";

export const loginApi = (data: UserLogin): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/login', data) as Promise<Response<WebResultUser>>
}

export const registerApi = (data: UserRegister): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/register', data) as Promise<Response<WebResultUser>>
}

export const refreshTokenApi = (data: { refreshToken: string }): Promise<Response<Token>> => {
    return serverApi.post('/auth/refresh', data) as Promise<Response<Token>>
}
//上传头像
export const uploadAvatarApi = (file: FormData) => serverApi.post('/user/upload-avatar', file) as Promise<Response<AvatarResult>>
//更新用户
export const updateUser = (data: UserUpdate) => serverApi.post('/user/update-user', data) as Promise<Response<UserUpdate>>
