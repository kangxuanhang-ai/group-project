import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { Config } from '@en/config';
import { IoAdapter } from '@nestjs/platform-socket.io';

// 定义端口配置
const ports = {
  server: 3000,
  ai: 3001,
  web: 8080
} as const;

// 如果Config不存在，我们直接设置
if (!Config.ports) {
  Config.ports = ports;
}
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  app.useWebSocketAdapter(new IoAdapter(app));
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  await app.listen(Config.ports.server);
  console.log(`Server running on http://localhost:${Config.ports.server}`);
}
bootstrap().then(() => {
  console.log('Application started successfully');
}).catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
