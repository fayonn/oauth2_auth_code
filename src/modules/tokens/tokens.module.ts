import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';

@Module({
  providers: [TokensService, TokensRepository],
  exports: [TokensService],
})
export class TokensModule {}
