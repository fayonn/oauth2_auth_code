import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsRepository } from './admins.repository';
import { AdminsController } from './admins.controller';
import { TokensModule } from '../tokens/tokens.module';
import { HashModule } from '../hash/hash.module';

@Module({
  imports: [TokensModule, HashModule],
  providers: [AdminsService, AdminsRepository],
  controllers: [AdminsController],
})
export class AdminsModule {}
