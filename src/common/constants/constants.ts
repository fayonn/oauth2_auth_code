import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as process from 'process';
import { join } from 'path';

config({ path: `${join(__dirname, '..', '..', '..', 'envs', `.env.${process.env.ENV}`)}` });
const configService = new ConfigService();

export const BASE_URL = `${configService.getOrThrow<string>('HOST')}:${configService.getOrThrow<string>('PORT')}`;
