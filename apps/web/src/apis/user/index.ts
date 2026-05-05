import { serverApi, type Response } from "..";
import type { UserLogin, UserRegister, WebResultUser } from "@en/common/user";

export const loginApi = (data: UserLogin): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/login', data) as Promise<Response<WebResultUser>>
}

export const registerApi = (data: UserRegister): Promise<Response<WebResultUser>> => {
    return serverApi.post('/auth/register', data) as Promise<Response<WebResultUser>>
}
