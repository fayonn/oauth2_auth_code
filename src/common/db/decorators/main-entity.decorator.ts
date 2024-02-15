import { Entity } from 'typeorm';
import * as process from 'process';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

config({ path: `${join(__dirname, '..', '..', '..', '..', 'envs', `.env.${process.env.ENV}`)}` });
const configService = new ConfigService();
const dbName = configService.getOrThrow<string>('DB_MAIN_DATABASE');

export function MainEntity(tableName: string) {
  return Entity({ name: tableName, database: dbName });
}
