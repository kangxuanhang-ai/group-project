import axios from 'axios'

export const refreshApi = axios.create({
    baseURL: '/api/v1',
    timeout: 50000,
})
refreshApi.interceptors.response.use(res => res.data)
