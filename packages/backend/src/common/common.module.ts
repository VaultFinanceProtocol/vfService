import { Global, Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

@Global()
@Module({
  providers: [
    HttpExceptionFilter,
    TransformInterceptor,
  ],
  exports: [
    HttpExceptionFilter,
    TransformInterceptor,
  ],
})
export class CommonModule {}
