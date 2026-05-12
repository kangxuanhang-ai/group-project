import axios from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { Token } from '@en/common/user'
import { refreshApi } from './refresh'
import { ElMessage } from 'element-plus'
export const uploadUrl = ''

export const timeout = 10000

// 主业务 API 实例
export const serverApi = axios.create({
    baseURL: '/api/v1',
    timeout,
})

// AI 服务 API 实例
export const aiApi = axios.create({
    baseURL: '/ai/v1',
    timeout,
})

interface QueueItem {
    resolve: (value: any) => void
    reject: (reason: any) => void
    config: any
    api: typeof serverApi
}

let requestQueue: QueueItem[] = []
let isRefreshing = false

async function handleRefreshError(error: any, api: typeof serverApi) {
    if(error.code==='ERR_NETWORK'){
        ElMessage.error('网络错误')
        return Promise.reject(error)
    }

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
        return new Promise((resolve, reject) => {
            requestQueue.push({ resolve, reject, config: originalRequest, api })
        })
    }

    isRefreshing = true
    try {
        const res: Response<Token> = await refreshApi.post('/auth/refresh', { refreshToken }) as any
        if (res.success) {
            userStore.updateToken(res.data)
            requestQueue.forEach(item => {
                item.config.headers.Authorization = `Bearer ${res.data.accessToken}`
                item.resolve(item.api(item.config))
            })
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`
            return api(originalRequest)
        } else {
            requestQueue.forEach(item => item.reject(error))
            userStore.logout()
            router.replace('/')
            return Promise.reject(error)
        }
    } catch {
        requestQueue.forEach(item => item.reject(error))
        userStore.logout()
        router.replace('/')
        return Promise.reject(error)
    } finally {
        requestQueue = []
        isRefreshing = false
    }
}

// 通用请求拦截器（注入 Bearer token）
const authRequestInterceptor = (config: any) => {
    const userStore = useUserStore()
    if (userStore.getAccessToken) {
        config.headers.Authorization = `Bearer ${userStore.getAccessToken}`
    }
    return config
}

// 通用响应成功拦截器（解包 data）
const responseSuccessInterceptor = (res: any) => res.data

serverApi.interceptors.request.use(authRequestInterceptor)
serverApi.interceptors.response.use(responseSuccessInterceptor, (error) => handleRefreshError(error, serverApi))

aiApi.interceptors.request.use(authRequestInterceptor)
aiApi.interceptors.response.use(responseSuccessInterceptor, (error) => handleRefreshError(error, aiApi))

export interface Response<T = any> {
    timestamp: string,
    path: string,
    message: string,
    code: number,
    success: boolean,
    data: T
}
