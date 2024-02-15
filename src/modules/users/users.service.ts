import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './user.users.entity';
import { Logger } from '../logger/decorators/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { Equal } from 'typeorm';

// C*UD for test
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Logger(UsersService.name) private readonly logger: LoggerService,
  ) {}

  // async save(user: Partial<User>) {
  //   const entity = this.usersRepository.create(user);
  //   return await this.usersRepository.save(entity);
  // }

  async findById(id: string) {
    return await this.usersRepository.findOne({ where: { id: Equal(id) } });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email: Equal(email) } });
  }

  // async update(id: string, attrs: Partial<User>) {
  //   const entity = await this.findById(id);
  //   if (!entity) throw new NotFoundException(`User not found. id=${id}`);
  //
  //   Object.assign(entity, attrs);
  //   return await this.save(entity);
  // }

  // async deleteById(id: string) {
  //   const entity = await this.findById(id);
  //   if (!entity) throw new NotFoundException(`User not found. id=${id}`);
  //
  //   return await this.usersRepository.remove(entity);
  // }

  async getAll() {
    return await this.usersRepository.find();
  }

  async findByEmailOrThrowError(email: string, errorHandler: () => void) {
    const user = await this.findByEmail(email);
    if (!user) errorHandler();
    return user;
  }

  async findByIdOrThrowError(id: string, errorHandler: () => void) {
    const user = await this.findById(id);
    if (!user) errorHandler();
    return user;
  }
}
