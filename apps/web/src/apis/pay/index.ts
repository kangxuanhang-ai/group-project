import { serverApi } from '../index'
import type { Response } from '../index'

export interface CreatePayDto {
  subject: string
  body: string
  total_amount: string
  courseId: string
}

export interface PayResponse {
  payUrl: string
  timeExpire: number
  orderId: string
}

export const createPay = (data: CreatePayDto): Promise<Response<PayResponse>> => {
  return serverApi.post('pay/create', data)
}

export const queryPayStatus = (orderId: string): Promise<Response<{ status: string; message: string; alipayStatus?: string }>> => {
  return serverApi.get(`pay/query/${orderId}`)
}

export const confirmPay = (orderId: string): Promise<Response<{ status: string; message: string }>> => {
  return serverApi.post('pay/confirm', { orderId })
}