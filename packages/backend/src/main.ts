import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // API Prefix
  const apiPrefix = configService.get<string>('API_PREFIX', '/api');
  app.setGlobalPrefix(apiPrefix);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validation
  app.useGlobalPipe(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('VaultFinance API')
    .setDescription('VaultFinance Lending Protocol API Documentation')
    .setVersion('1.0.0')
    .addTag('Vault', 'Vault global state management')
    .addTag('Pools', 'Asset pool management')
    .addTag('Positions', 'User position management')
    .addTag('Operations', 'Transaction operations')
    .addTag('Liquidations', 'Liquidation management')
    .addTag('Prices', 'Price oracle data')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start server
  const port = configService.get<number>('API_PORT', 3000);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/docs`);
}

bootstrap();
