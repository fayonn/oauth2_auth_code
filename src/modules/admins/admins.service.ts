import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AdminsRepository } from './admins.repository';
import { Admin } from './admin.main.entity';
import { TokensService } from '../tokens/tokens.service';
import { HashService } from '../hash/hash.service';
import { TokenType } from '../tokens/constants/token-type.enum';
import { ConfigService } from '@nestjs/config';
import { Logger } from '../logger/decorators/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { Equal } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class AdminsService {
  constructor(
    private readonly adminsRepository: AdminsRepository,
    private readonly tokenService: TokensService,
    private readonly hashService: HashService,
    private readonly configService: ConfigService,
    @Logger(AdminsService.name) private readonly logger: LoggerService,
  ) {}

  async save(admin: Partial<Admin>) {
    const instance = plainToInstance(Admin, admin);
    const errors = await validate(instance);
    if (errors.length) {
      this.logger.error(JSON.stringify(errors));
      throw new InternalServerErrorException();
    }

    const entity = this.adminsRepository.create(admin);
    const result = await this.adminsRepository.save(entity);

    this.logger.info('Admin was saved', { id: result.id });
    return result;
  }

  async findById(id: string) {
    return await this.adminsRepository.findOne({ where: { id: Equal(id) } });
  }

  async findByEmail(email: string) {
    return await this.adminsRepository.findOne({ where: { email: Equal(email) } });
  }

  async update(id: string, attrs: Partial<Admin>) {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException(`Admin not found. id=${id}`);

    Object.assign(entity, attrs);

    const instance = plainToInstance(Admin, entity);
    const errors = await validate(instance);
    if (errors.length) {
      this.logger.error(JSON.stringify(errors));
      throw new InternalServerErrorException();
    }

    const result = await this.save(entity);

    this.logger.info('Admin was updated', { id: result.id });
    return result;
  }

  async deleteById(id: string) {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException(`Admin not found. id=${id}`);
    const result = await this.adminsRepository.remove(entity);

    this.logger.info('Admin was deleted', { id: result.id });
    return result;
  }

  async getAll() {
    return await this.adminsRepository.find();
  }

  async findByIdOrThrowError(id: string, errorHandler: () => void) {
    const admin = await this.findById(id);
    if (!admin) errorHandler();
    return admin;
  }

  async findByEmailOrThrowError(email: string, errorHandler: () => void) {
    const admin = await this.findByEmail(email);
    if (!admin) errorHandler();
    return admin;
  }

  async login(email: string, password: string) {
    const admin = await this.findByEmailOrThrowError(email, () => {
      throw new ForbiddenException('Wrong email or password');
    });

    if (!(await this.hashService.compareHash(password, admin.password))) {
      throw new ForbiddenException('Wrong email or password');
    }

    const innerTokenLifetimeInMinutes = +this.configService.getOrThrow<number>('JWT_INNER_LIFETIME_MINUTES');

    return await this.tokenService.generateToken(
      {
        sub: admin.id,
      },
      TokenType.INNER_TOKEN,
      innerTokenLifetimeInMinutes * 60,
    );
  }
}
