export class CreatePayDto {
  subject: string
  body: string
  total_amount: string
  courseId: string
}

export class QueryPayStatusDto {
  orderId: string
}

export interface PayResponse {
  code: number
  data: {
    payUrl: string
    timeExpire: number
    orderId: string
  }
}

export interface QueryPayStatusResponse {
  code: number
  data: {
    status: string
    message: string
    alipayStatus?: string
  }
}