import { Entity } from 'typeorm';
import * as process from 'process';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: `${join(__dirname, '..', '..', '..', '..', 'envs', `.env.${process.env.ENV}`)}` });
const configService = new ConfigService();
const dbName = configService.getOrThrow<string>('DB_USERS_DATABASE');

export function UsersEntity(tableName: string) {
  return Entity({ name: tableName, database: dbName });
}
