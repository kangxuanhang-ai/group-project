import axios from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { Token } from '@en/common/user'

export const timeout = 50000

// 刷新 token 专用实例（不带拦截器，避免循环依赖）
export const refreshApi = axios.create({
    baseURL: '/api/v1',
    timeout,
})
refreshApi.interceptors.response.use(res => {
    return res.data
})

// 主业务 API 实例
export const serverApi = axios.create({
    baseURL: '/api/v1',
    timeout,
})

let requestQueue: ((newAccessToken: string) => void)[] = []
let isRefreshing = false

serverApi.interceptors.request.use(config => {
    const userStore = useUserStore()
    if (userStore.getAccessToken) {
        config.headers.Authorization = `Bearer ${userStore.getAccessToken}`
    }
    return config
})

serverApi.interceptors.response.use(res => {
    return res.data
}, async error => {
    if (error.response?.status !== 401) {
        return Promise.reject(error)
    }

    const userStore = useUserStore()
    const accessToken = userStore.getAccessToken
    const refreshToken = userStore.getRefreshToken
    const originalRequest = error.config

    if (!accessToken || !refreshToken) {
        userStore.logout()
        router.replace('/')
        return Promise.reject(error)
    }

    if (isRefreshing) {
        return new Promise((resolve) => {
            requestQueue.push((newAccessToken: string) => {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                resolve(serverApi(originalRequest))
            })
        })
    }

    isRefreshing = true
    try {
        const res: Response<Token> = await refreshApi.post('/auth/refresh', { refreshToken }) as any
        if (res.success) {
            userStore.updateToken(res.data)
            requestQueue.forEach(callback => callback(res.data.accessToken))
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`
            return serverApi(originalRequest)
        } else {
            userStore.logout()
            router.replace('/')
            return Promise.reject(error)
        }
    } catch {
        userStore.logout()
        router.replace('/')
        return Promise.reject(error)
    } finally {
        requestQueue = []
        isRefreshing = false
    }
})

// AI 服务 API 实例
export const aiApi = axios.create({
    baseURL: '/api/ai/v1',
    timeout,
})

aiApi.interceptors.response.use(res => {
    return res.data
})

export interface Response<T = any> {
    timestamp: string,
    path: string,
    message: string,
    code: number,
    success: boolean,
    data: T
}
