import { serverApi, type Response } from "..";
import type { UserLogin, UserRegister, WebResultUser, Token, AvatarResult, UserUpdate } from "@en/common/user";

export const loginApi = (data: UserLogin): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/login', data) as Promise<Response<WebResultUser>>
}

export const registerApi = (data: UserRegister & { code: string }): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/register', data) as Promise<Response<WebResultUser>>
}

export const refreshTokenApi = (data: { refreshToken: string }): Promise<Response<Token>> => {
    return serverApi.post('/auth/refresh', data) as Promise<Response<Token>>
}
<<<<<<< HEAD
//上传头像
export const uploadAvatarApi = (file: FormData) => serverApi.post('/user/upload-avatar', file) as Promise<Response<AvatarResult>>
//更新用户
export const updateUser = (data: UserUpdate) => serverApi.post('/user/update-user', data) as Promise<Response<UserUpdate>>
=======

export const sendCodeApi = (phone: string): Promise<Response<null>> => {
    return serverApi.post('/auth/send-code', { phone }) as Promise<Response<null>>
}
>>>>>>> 93102f4a7e42981493746188112dd1d0fd109910
