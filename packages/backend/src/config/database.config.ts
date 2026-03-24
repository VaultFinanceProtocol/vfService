import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get('database');

    return {
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.configService.get('NODE_ENV') === 'development',
      logging: this.configService.get('NODE_ENV') === 'development',
      namingStrategy: new SnakeNamingStrategy(),
      migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
      migrationsRun: false,
    };
  }
}
