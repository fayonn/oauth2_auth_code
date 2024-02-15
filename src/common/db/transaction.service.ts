import { DeepPartial, EntityTarget, FindOptionsWhere, QueryRunner } from 'typeorm';
import { Base } from './base.entity';
import { NotFoundException } from '@nestjs/common';
import { LoggerService } from '../../modules/logger/logger.service';

export class TransactionService<Entity extends Base> {
  constructor(private readonly target: EntityTarget<Entity>) {}

  async save(obj: DeepPartial<Entity>, connection: QueryRunner, logger?: LoggerService) {
    const result = await connection.manager.save(this.target, obj);
    if (logger) {
      logger.info(`${this.target} was saved`, { id: result.id });
    }
    return result;
  }

  async create(obj: DeepPartial<Entity>, connection: QueryRunner) {
    return connection.manager.create(this.target, obj);
  }

  async findById(id: string, connection: QueryRunner, relations?: string[]) {
    return await connection.manager.findOne(this.target, {
      where: { id } as FindOptionsWhere<Entity>,
      relations: relations,
    });
  }

  async update(
    id: string,
    attrs: DeepPartial<Entity>,
    connection: QueryRunner,
    relations?: string[],
    logger?: LoggerService,
  ) {
    const obj = await this.findById(id, connection, relations);
    if (!obj) throw new NotFoundException(`${this.target} not found. id=${id}`);

    Object.assign(obj, attrs);
    const result = await this.save(obj, connection);

    if (logger) {
      logger.info(`${this.target} was updated`, { id: result.id });
    }
    return result;
  }

  async remove(obj: Entity, connection: QueryRunner, logger?: LoggerService) {
    const result = await connection.manager.remove(this.target, obj);
    if (logger) {
      logger.info(`${this.target} was removed`, { id: result.id });
    }

    return result;
  }

  async deleteById(id: string, connection: QueryRunner, logger?: LoggerService) {
    const obj = await this.findById(id, connection);
    if (!obj) throw new NotFoundException(`${this.target} not found. id=${id}`);

    return await this.remove(obj, connection, logger);
  }
}
