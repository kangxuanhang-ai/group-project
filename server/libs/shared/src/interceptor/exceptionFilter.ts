import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch(HttpException)
export class InterceptorExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const request = ctx.getRequest()
        const response = ctx.getResponse()
        const isProduction = process.env.NODE_ENV === 'production'
        const message = isProduction && exception.getStatus() >= 500
            ? '服务器繁忙，请稍后再试'
            : exception.message
        response.status(exception.getStatus()).json({
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            code: exception.getStatus(),
            success: false
        })
    }
}