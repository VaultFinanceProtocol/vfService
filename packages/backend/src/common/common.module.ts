import { Global, Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { CacheService } from './services/cache.service';

@Global()
@Module({
  providers: [
    HttpExceptionFilter,
    TransformInterceptor,
    CacheService,
  ],
  exports: [
    HttpExceptionFilter,
    TransformInterceptor,
    CacheService,
  ],
})
export class CommonModule {}
