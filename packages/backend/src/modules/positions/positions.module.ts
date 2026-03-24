import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolModule } from '../protocol/protocol.module';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';
import { PositionEntity } from './entities/position.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PositionEntity]),
    ProtocolModule,
  ],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}
