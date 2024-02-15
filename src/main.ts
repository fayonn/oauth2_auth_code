import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';
import { config } from 'dotenv';
import * as process from 'process';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './modules/logger/logger.service';

async function bootstrap() {
  config({ path: `${join(__dirname, '..', 'envs', `.env.${process.env.ENV}`)}` });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new LoggerService(),
  });
  const configService = new ConfigService();

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.enableCors();

  await app.listen(+configService.getOrThrow<number>('PORT'));
}
bootstrap();
