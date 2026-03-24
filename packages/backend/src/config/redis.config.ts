import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullRootModuleOptions, SharedBullConfigurationFactory } from '@nestjs/bullmq';

@Injectable()
export class RedisConfig implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) {}

  createSharedConfiguration(): BullRootModuleOptions {
    const redisConfig = this.configService.get('redis');

    return {
      connection: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
      },
    };
  }
}
