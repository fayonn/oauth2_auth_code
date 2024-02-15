import * as process from 'process';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { InjectDataSource } from '@nestjs/typeorm';
import { join } from 'path';

config({ path: `${join(__dirname, '..', '..', '..', '..', 'envs', `.env.${process.env.ENV}`)}` });
const configService = new ConfigService();
const dbName = configService.getOrThrow<string>('DB_MAIN_DATABASE');

export function MainDataSource() {
  return InjectDataSource(dbName);
}
