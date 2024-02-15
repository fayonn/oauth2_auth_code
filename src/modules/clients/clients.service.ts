import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { Client } from './client.main.entity';
import { Logger } from '../logger/decorators/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { Equal } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    @Logger(ClientsService.name) private readonly logger: LoggerService,
  ) {}

  async save(client: Partial<Client>) {
    const instance = plainToInstance(Client, client);
    const errors = await validate(instance);
    if (errors.length) {
      this.logger.error(JSON.stringify(errors));
      throw new InternalServerErrorException();
    }

    const entity = this.clientsRepository.create(client);
    const result = await this.clientsRepository.save(entity);

    this.logger.info('Client was updated', { id: result.id });
    return result;
  }

  async findById(id: string) {
    return await this.clientsRepository.findOne({ where: { id: Equal(id) }, relations: ['scopes'] });
  }

  async update(id: string, attrs: Partial<Client>) {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException(`Client not found. id=${id}`);

    Object.assign(entity, attrs);

    const instance = plainToInstance(Client, entity);
    const errors = await validate(instance);
    if (errors.length) {
      this.logger.error(JSON.stringify(errors));
      throw new InternalServerErrorException();
    }

    const result = await this.save(entity);

    this.logger.info('Client was updated', { id: result.id });
    return result;
  }

  async deleteById(id: string) {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException(`Client not found. id=${id}`);
    const result = await this.clientsRepository.remove(entity);

    this.logger.info('Client was deleted', { id: result.id });
    return result;
  }

  async getAll() {
    return await this.clientsRepository.find({ relations: ['scopes'] });
  }

  async findByIdOrThrowError(id: string, errorHandler: () => void) {
    const client = await this.findById(id);
    if (!client) errorHandler();
    return client;
  }
}
