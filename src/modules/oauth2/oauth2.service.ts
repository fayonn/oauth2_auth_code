import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { HashService } from '../hash/hash.service';
import { TokensService } from '../tokens/tokens.service';
import { ConfigService } from '@nestjs/config';
import { AuthorizationCodesService } from '../authorization-codes/authorization-codes.service';
import { Client } from '../clients/client.main.entity';
import { User } from '../users/user.users.entity';
import { TokenType } from '../tokens/constants/token-type.enum';
import { AuthorizationException } from './exceptions/authorization.exception';
import { Oauth2ErrorMessage } from './constants/oauth2-error-message.enum';
import { TokenException } from './exceptions/token.exception';
import { Transaction } from '../../common/db/transaction';
import { MainDataSource } from '../../common/db/decorators/main-data-source.decorator';
import { DataSource } from 'typeorm';
import { Logger } from '../logger/decorators/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class Oauth2Service {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly tokenService: TokensService,
    private readonly configService: ConfigService,
    private readonly authorizationCodesService: AuthorizationCodesService,
    private readonly clientsService: ClientsService,
    @MainDataSource() private readonly mainDataSource: DataSource,
    @Logger(Oauth2Service.name) private readonly logger: LoggerService,
  ) {}

  async authorize(email: string, password: string) {
    const user = await this.usersService.findByEmailOrThrowError(email, () => {
      throw new AuthorizationException({
        title: Oauth2ErrorMessage.INVALID_REQUEST,
        message: 'Wrong email or password',
        statusCode: 400,
        property: 'email',
      });
    });

    if (!(await this.hashService.compareHash(password, user.password))) {
      throw new AuthorizationException({
        title: Oauth2ErrorMessage.INVALID_REQUEST,
        message: 'Wrong email or password',
        statusCode: 400,
        property: 'email',
      });
    }

    return user;
  }

  async handleConsent(client: Client, user: User, redirectUri: string, scopes: string[]) {
    const authCodeLifeTime = +this.configService.getOrThrow<number>('AUTHORIZATION_CODE_LIFETIME_MINUTES');

    const activeAuthCode = await this.authorizationCodesService.getActiveOne({
      clientId: client.id,
      userId: user.id,
    });

    // if an active code is found, it will be returned
    if (activeAuthCode) {
      return activeAuthCode;
    }

    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + authCodeLifeTime);

    return await this.authorizationCodesService.save({
      client: client,
      userId: user.id,
      redirectUri: redirectUri,
      scopes: scopes,
      expiresAt: expiredAt,
    });
  }

  async handleAccessToken(code: string, redirectUri: string, clientId: string) {
    const transaction = new Transaction(
      [
        {
          queryRunner: this.mainDataSource.createQueryRunner(),
          handlerName: 'mainConnection',
        },
      ],
      Oauth2Service.name,
    );
    await transaction.start();

    try {
      const authCode = await this.authorizationCodesService.findByCodeOrThrowError(code, () => {
        throw new TokenException({
          title: Oauth2ErrorMessage.INVALID_GRANT,
          message: 'Wrong authorization code',
          statusCode: 400,
        });
      });

      if (authCode.redirectUri !== redirectUri) {
        throw new TokenException({
          title: Oauth2ErrorMessage.INVALID_REQUEST,
          message: 'Wrong redirect uri',
          statusCode: 400,
        });
      }

      if (authCode.client.id !== clientId) {
        throw new TokenException({
          title: Oauth2ErrorMessage.INVALID_CLIENT,
          message: 'Wrong client id',
          statusCode: 401,
        });
      }

      if (authCode.isUsed || authCode.expiresAt < new Date()) {
        throw new TokenException({
          title: Oauth2ErrorMessage.INVALID_GRANT,
          message: 'Authorization code is deactivated',
          statusCode: 400,
        });
      }

      const user = await this.usersService.findByIdOrThrowError(authCode.userId, () => {
        throw new TokenException({
          title: Oauth2ErrorMessage.SERVER_ERROR,
          message: 'User for authorization code does not exists',
          statusCode: 500,
        });
      });

      await this.authorizationCodesService.update(authCode.id, {
        isUsed: true,
      });
      this.logger.info(`Authorization code is used`, {
        code: authCode.code,
        userId: authCode.userId,
        clientId: authCode.client.id,
      });

      // step 2
      const activePair = await this.tokenService.getActiveTokenPair(user.id);
      if (activePair) {
        await transaction.commit();
        return activePair;
      }

      const accessTokenLifetimeInMinutes = +this.configService.getOrThrow<number>('JWT_ACCESS_LIFETIME_MINUTES');
      const refreshTokenLifetimeInMinutes = +this.configService.getOrThrow<number>('JWT_REFRESH_LIFETIME_MINUTES');

      const tokenPair = await this.tokenService.generateAndSaveTokenPair(
        user.id,
        {
          lifetimeInMinutes: accessTokenLifetimeInMinutes,
          payload: { sub: user.id },
        },
        {
          lifetimeInMinutes: refreshTokenLifetimeInMinutes,
          payload: { sub: user.id },
        },
        transaction.handlers['mainConnection'],
        this.logger,
      );

      await transaction.commit();

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
      };
    } catch (e) {
      await transaction.rollback();
      throw e;
    } finally {
      await transaction.release();
    }
  }

  async handleRefreshToken(token: string) {
    const transaction = new Transaction(
      [
        {
          queryRunner: this.mainDataSource.createQueryRunner(),
          handlerName: 'mainConnection',
        },
      ],
      Oauth2Service.name,
    );
    await transaction.start();

    try {
      const refreshToken = await this.tokenService.findByTokenAndTypeOrThrowError(
        token,
        TokenType.REFRESH_TOKEN,
        () => {
          throw new TokenException({
            title: Oauth2ErrorMessage.INVALID_GRANT,
            message: 'Refresh token was not found',
            statusCode: 400,
          });
        },
      );

      if (refreshToken.expiredAt < new Date()) {
        throw new TokenException({
          title: Oauth2ErrorMessage.INVALID_GRANT,
          message: 'Refresh token is expired',
          statusCode: 403,
        });
      }

      // Експайрю пару токенів
      await this.tokenService.transaction.update(
        refreshToken.id,
        { expiredAt: new Date() },
        transaction.handlers['mainConnection'],
        undefined,
        this.logger,
      );

      await this.tokenService.transaction.update(
        refreshToken.pair.id,
        {
          expiredAt: new Date(),
        },
        transaction.handlers['mainConnection'],
        undefined,
        this.logger,
      );

      const accessTokenLifetimeInMinutes = +this.configService.getOrThrow<number>('JWT_ACCESS_LIFETIME_MINUTES');
      const refreshTokenLifetimeInMinutes = +this.configService.getOrThrow<number>('JWT_REFRESH_LIFETIME_MINUTES');

      const tokenPair = await this.tokenService.generateAndSaveTokenPair(
        refreshToken.sub,
        {
          lifetimeInMinutes: accessTokenLifetimeInMinutes,
          payload: { sub: refreshToken.sub },
        },
        {
          lifetimeInMinutes: refreshTokenLifetimeInMinutes,
          payload: { sub: refreshToken.sub },
        },
        transaction.handlers['mainConnection'],
        this.logger,
      );

      await transaction.commit();

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
      };
    } catch (e) {
      await transaction.rollback();
      throw e;
    } finally {
      await transaction.release();
    }
  }
}
