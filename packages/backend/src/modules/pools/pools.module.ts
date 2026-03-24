import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolModule } from '../protocol/protocol.module';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { PoolEntity } from './entities/pool.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PoolEntity]),
    ProtocolModule,
  ],
  controllers: [PoolsController],
  providers: [PoolsService],
  exports: [PoolsService],
})
export class PoolsModule {}
