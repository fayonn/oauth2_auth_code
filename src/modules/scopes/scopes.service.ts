import { Injectable } from '@nestjs/common';
import { ScopesRepository } from './scopes.repository';
import { In } from 'typeorm';
import { Logger } from '../logger/decorators/logger.decorator';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ScopesService {
  constructor(
    private readonly scopesRepository: ScopesRepository,
    @Logger(ScopesService.name) private readonly logger: LoggerService,
  ) {}

  async verifyScopes(clientId: string, scopes: string[]): Promise<boolean> {
    const entities = await this.scopesRepository.find({
      where: { client: { id: clientId }, title: In(scopes) },
    });

    return entities.length === scopes.length;
  }
}
