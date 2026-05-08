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