import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ProtocolService } from '../protocol/protocol.service';
import { PositionsService } from '../positions/positions.service';
import { PriceService } from '../price/price.service';

interface SubscribePoolData {
  asset: string;
}

interface SubscribePositionData {
  userAddr: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'ws',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebsocketGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private protocolService: ProtocolService,
    private positionsService: PositionsService,
    private priceService: PriceService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { message: 'Connected to VaultFinance WebSocket' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:protocol')
  async handleSubscribeProtocol(client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to protocol stats`);
    client.join('protocol');

    // Send initial data
    const stats = await this.protocolService.getProtocolStats();
    client.emit('protocol:stats', stats);

    return { event: 'subscribed', data: { channel: 'protocol' } };
  }

  @SubscribeMessage('subscribe:pool')
  async handleSubscribePool(client: Socket, data: SubscribePoolData) {
    const { asset } = data;
    this.logger.log(`Client ${client.id} subscribed to pool ${asset}`);
    client.join(`pool:${asset}`);

    // Send initial pool data
    const pool = await this.protocolService.getPoolView(asset);
    client.emit('pool:data', pool);

    return { event: 'subscribed', data: { channel: `pool:${asset}` } };
  }

  @SubscribeMessage('subscribe:position')
  async handleSubscribePosition(client: Socket, data: SubscribePositionData) {
    const { userAddr } = data;
    this.logger.log(`Client ${client.id} subscribed to position ${userAddr}`);
    client.join(`position:${userAddr}`);

    // Send initial position data
    const position = await this.positionsService.getUserPositions(userAddr);
    client.emit('position:data', position);

    return { event: 'subscribed', data: { channel: `position:${userAddr}` } };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, channel: string) {
    this.logger.log(`Client ${client.id} unsubscribed from ${channel}`);
    client.leave(channel);
    return { event: 'unsubscribed', data: { channel } };
  }

  /**
   * Broadcast protocol stats update to all subscribed clients
   */
  async broadcastProtocolStats() {
    const stats = await this.protocolService.getProtocolStats();
    this.server.to('protocol').emit('protocol:stats', stats);
  }

  /**
   * Broadcast pool update to subscribed clients
   */
  async broadcastPoolUpdate(asset: string) {
    const pool = await this.protocolService.getPoolView(asset);
    this.server.to(`pool:${asset}`).emit('pool:update', pool);
  }

  /**
   * Broadcast position update to subscribed clients
   */
  async broadcastPositionUpdate(userAddr: string) {
    const position = await this.positionsService.getUserPositions(userAddr);
    this.server.to(`position:${userAddr}`).emit('position:update', position);
  }

  /**
   * Broadcast price update
   */
  async broadcastPriceUpdate(asset: string, price: number) {
    this.server.emit('price:update', { asset, price, timestamp: Date.now() });
  }

  /**
   * Broadcast liquidation alert
   */
  async broadcastLiquidationAlert(data: {
    userAddr: string;
    healthFactor: string;
    symbol: string;
    potentialProfitUSD: string;
  }) {
    this.server.emit('liquidation:alert', {
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast transaction confirmation
   */
  async broadcastTransactionConfirmation(data: {
    txid: string;
    userAddr: string;
    status: string;
    confirmations?: number;
  }) {
    this.server.to(`position:${data.userAddr}`).emit('transaction:confirmation', {
      ...data,
      timestamp: Date.now(),
    });
  }
}
