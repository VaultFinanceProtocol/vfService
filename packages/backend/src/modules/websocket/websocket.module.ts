import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { ProtocolModule } from '../protocol/protocol.module';
import { PositionsModule } from '../positions/positions.module';
import { PriceModule } from '../price/price.module';

@Module({
  imports: [ProtocolModule, PositionsModule, PriceModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
