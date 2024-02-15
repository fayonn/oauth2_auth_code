import { config } from 'dotenv';
import * as process from 'process';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

config({ path: `${join(__dirname, '..', '..', 'envs', `.env.${process.env.ENV}`)}` });
const configService = new ConfigService();

export const mainDataSourceOptions: DataSourceOptions = {
  name: configService.getOrThrow<string>('DB_MAIN_DATABASE'),
  type: 'postgres',
  host: configService.getOrThrow<string>('DB_MAIN_HOST'),
  port: +configService.getOrThrow<number>('DB_MAIN_PORT'),
  username: configService.getOrThrow<string>('DB_MAIN_USERNAME'),
  password: configService.getOrThrow<string>('DB_MAIN_PASSWORD'),
  database: configService.getOrThrow<string>('DB_MAIN_DATABASE'),
  entities: ['dist/**/*.main.entity.js'],
  migrations: [`${join(__dirname, '..', '..', 'migrations', '**')}`],
  synchronize: configService.getOrThrow<string>('ENV') === ('dev' || 'test'),
};

const mainDataSource = new DataSource(mainDataSourceOptions);
export default mainDataSource;
