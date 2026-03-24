import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PoolEntity } from '../pools/entities/pool.entity';

/**
 * Admin Module
 *
 * Admin operations:
 * - Add pool
 * - Pause/unpause
 * - View risk parameters
 *
 * Read-only + limited write for MVP.
 */
@Module({
  imports: [TypeOrmModule.forFeature([PoolEntity])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
