import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { Oauth2Module } from './modules/oauth2/oauth2.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mainDataSourceOptions } from './configs/main-db.config';
import { usersDataSourceOptions } from './configs/users-db.config';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from './modules/clients/clients.module';
import * as process from 'process';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TokensModule } from './modules/tokens/tokens.module';
import { HashModule } from './modules/hash/hash.module';
import { ScopesModule } from './modules/scopes/scopes.module';
import { AdminsModule } from './modules/admins/admins.module';
import { AuthorizationCodesModule } from './modules/authorization-codes/authorization-codes.module';
import { LoggerModule } from './modules/logger/logger.module';
import { RequestLoggerMiddleware } from './common/middlewares/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `envs/.env.${process.env.ENV}`,
    }),
    TypeOrmModule.forRoot(mainDataSourceOptions),
    TypeOrmModule.forRoot(usersDataSourceOptions),
    ServeStaticModule.forRoot({
      serveRoot: '/css',
      rootPath: join(__dirname, '..', 'public/css'),
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/scripts',
      rootPath: join(__dirname, '..', 'public/scripts'),
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/images',
      rootPath: join(__dirname, '..', 'public/images'),
    }),
    UsersModule,
    Oauth2Module,
    ClientsModule,
    HashModule,
    TokensModule,
    ScopesModule,
    AdminsModule,
    AuthorizationCodesModule,
    LoggerModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
