import { Module } from '@nestjs/common';
import { ScopesService } from './scopes.service';
import { ScopesRepository } from './scopes.repository';

@Module({
  providers: [ScopesService, ScopesRepository],
  exports: [ScopesService],
})
export class ScopesModule {}
