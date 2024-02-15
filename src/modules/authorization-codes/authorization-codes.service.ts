import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AuthorizationCodesRepository } from './authorization-codes.repository';
import { AuthorizationCode } from './authorization-code.main.entity';
import { Logger } from '../logger/decorators/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { Equal } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class AuthorizationCodesService {
  constructor(
    public readonly authorizationCodesRepository: AuthorizationCodesRepository,
    @Logger(AuthorizationCodesService.name) private readonly logger: LoggerService,
  ) {}

  get transaction() {
    return this.authorizationCodesRepository.transaction;
  }

  async getActiveOne(options: { clientId: string; userId: string }) {
    return await this.authorizationCodesRepository.getActiveOne(options);
  }

  async save(authCode: Partial<AuthorizationCode>) {
    const instance = plainToInstance(AuthorizationCode, authCode);
    const errors = await validate(instance);
    if (errors.length) {
      this.logger.error(JSON.stringify(errors));
      throw new InternalServerErrorException();
    }

    const entity = this.authorizationCodesRepository.create(authCode);
    const result = await this.authorizationCodesRepository.save(entity);

    this.logger.info('Authorization code was saved', { id: result.id });
    return result;
  }

  async findByCode(code: string) {
    return await this.authorizationCodesRepository.findOne({
      where: { code: Equal(code) },
      relations: ['client'],
    });
  }

  async findById(id: string) {
    return await this.authorizationCodesRepository.findOne({
      where: { id: Equal(id) },
      relations: ['client'],
    });
  }

  async update(id: string, attrs: Partial<AuthorizationCode>) {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException(`Authorization code not found. id=${id}`);

    Object.assign(entity, attrs);

    const instance = plainToInstance(AuthorizationCode, entity);
    const errors = await validate(instance);
    if (errors.length) {
      this.logger.error(JSON.stringify(errors));
      throw new InternalServerErrorException();
    }

    const result = await this.save(entity);

    this.logger.info('Authorization code was updated', { id: result.id });
    return result;
  }

  async findByIdOrThrowError(id: string, errorHandler: () => void) {
    const authCode = await this.findById(id);
    if (!authCode) errorHandler();
    return authCode;
  }

  async findByCodeOrThrowError(code: string, errorHandler: () => void) {
    const authCode = await this.findByCode(code);
    if (!authCode) errorHandler();
    return authCode;
  }
}
