import { serverApi, type Response } from "..";
import type { UserLogin, UserRegister, WebResultUser, Token } from "@en/common/user";

export const loginApi = (data: UserLogin): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/login', data) as Promise<Response<WebResultUser>>
}

export const registerApi = (data: UserRegister & { code: string }): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/register', data) as Promise<Response<WebResultUser>>
}

export const refreshTokenApi = (data: { refreshToken: string }): Promise<Response<Token>> => {
    return serverApi.post('/auth/refresh', data) as Promise<Response<Token>>
}

export const sendCodeApi = (phone: string): Promise<Response<null>> => {
    return serverApi.post('/auth/send-code', { phone }) as Promise<Response<null>>
}
