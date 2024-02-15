import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [TokensModule],
  providers: [ClientsService, ClientsRepository],
  controllers: [ClientsController],
  exports: [ClientsService],
})
export class ClientsModule {}
