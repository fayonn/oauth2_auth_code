import { config } from 'dotenv';
import * as process from 'process';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

config({ path: `${join(__dirname, '..', '..', 'envs', `.env.${process.env.ENV}`)}` });
const configService = new ConfigService();

export const usersDataSourceOptions: DataSourceOptions = {
  name: configService.getOrThrow<string>('DB_USERS_DATABASE'),
  type: 'postgres',
  host: configService.getOrThrow<string>('DB_USERS_HOST'),
  port: +configService.getOrThrow<number>('DB_USERS_PORT'),
  username: configService.getOrThrow<string>('DB_USERS_USERNAME'),
  password: configService.getOrThrow<string>('DB_USERS_PASSWORD'),
  database: configService.getOrThrow<string>('DB_USERS_DATABASE'),
  entities: ['dist/**/*.users.entity.js'],
  synchronize: configService.getOrThrow<string>('ENV') === ('dev' || 'test'),
};
const usersDataSource = new DataSource(usersDataSourceOptions);

export default usersDataSource;
