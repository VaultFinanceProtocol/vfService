import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';
import { ProtocolModule } from '../protocol/protocol.module';

@Module({
  imports: [ProtocolModule],
  controllers: [VaultController],
  providers: [VaultService],
  exports: [VaultService],
})
export class VaultModule {}
