import { serverApi, type Response } from "..";
import type { UserLogin, UserRegister, WebResultUser, Token } from "@en/common/user";

export const loginApi = (data: UserLogin): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/login', data) as Promise<Response<WebResultUser>>
}

export const registerApi = (data: UserRegister): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/register', data) as Promise<Response<WebResultUser>>
}

export const refreshTokenApi = (data: { refreshToken: string }): Promise<Response<Token>> => {
    return serverApi.post('/auth/refresh', data) as Promise<Response<Token>>
}
