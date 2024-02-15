import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TokenType } from './constants/token-type.enum';
import { decode, JwtPayload, sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { TokensRepository } from './tokens.repository';
import { Token } from './token.main.entity';
import { Equal, MoreThan, QueryRunner } from 'typeorm';
import { Logger } from '../logger/decorators/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

// https://travistidwell.com/jsencrypt/demo/
@Injectable()
export class TokensService {
  private readonly jwtPrivateKey: string;
  private readonly ALGORITHM = 'RS256';
  constructor(
    private readonly configService: ConfigService,
    private readonly tokensRepository: TokensRepository,
    @Logger(TokensService.name) private readonly logger: LoggerService,
  ) {
    this.jwtPrivateKey = configService.getOrThrow<string>('JWT_PRIVATE_KEY');
  }

  get transaction() {
    return this.tokensRepository.transaction;
  }

  async generateToken(payload: { sub: string }, tokenType: TokenType, expiresIn: number): Promise<string> {
    const iat: number = Math.floor(Date.now() / 1000);

    try {
      return new Promise((resolve, reject) => {
        sign(
          {
            ...payload,
            token_type: tokenType,
            iat: iat,
          },
          this.jwtPrivateKey,
          { algorithm: this.ALGORITHM, expiresIn: expiresIn },
          (error, encoded: string) => {
            if (error) reject(error);
            resolve(encoded);
          },
        );
      });
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async verifyToken(token: string, publicKey: string, tokenType: TokenType) {
    try {
      const decoded = verify(token, publicKey, {
        algorithms: [this.ALGORITHM],
      });

      if (new Date() > new Date(parseInt((decoded as any).exp) * 1000)) {
        return false;
      } else if ((decoded as any).token_type !== tokenType) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      throw new ForbiddenException();
    }
  }

  async generateAndSaveTokenPair(
    sub: string,
    accessTokenData: {
      lifetimeInMinutes: number;
      payload: { sub: string };
    },
    refreshTokenData: {
      lifetimeInMinutes: number;
      payload: { sub: string };
    },
    connection?: QueryRunner,
    logger?: LoggerService,
  ) {
    const accessToken = await this.generateToken(
      accessTokenData.payload,
      TokenType.ACCESS_TOKEN,
      accessTokenData.lifetimeInMinutes * 60,
    );

    const refreshToken = await this.generateToken(
      refreshTokenData.payload,
      TokenType.REFRESH_TOKEN,
      refreshTokenData.lifetimeInMinutes * 60,
    );

    const accessExpiredAt = new Date();
    accessExpiredAt.setMinutes(accessExpiredAt.getMinutes() + accessTokenData.lifetimeInMinutes);

    const accessData = {
      type: TokenType.ACCESS_TOKEN,
      token: accessToken,
      payload: accessTokenData.payload,
      expiredAt: accessExpiredAt,
      sub: sub,
    };
    const access = connection
      ? await this.transaction.save(accessData, connection, logger)
      : await this.save(accessData);

    const refreshExpiredAt = new Date();
    refreshExpiredAt.setMinutes(refreshExpiredAt.getMinutes() + refreshTokenData.lifetimeInMinutes);

    const refreshData = {
      type: TokenType.REFRESH_TOKEN,
      token: refreshToken,
      payload: refreshTokenData.payload,
      expiredAt: refreshExpiredAt,
      pair: access,
      sub: sub,
    };
    const refresh = connection
      ? await this.transaction.save(refreshData, connection, logger)
      : await this.save(refreshData);

    connection
      ? await this.transaction.update(access.id, { pair: refresh }, connection, undefined, logger)
      : await this.update(access.id, { pair: refresh });

    return {
      accessToken: access,
      refreshToken: refresh,
    };
  }

  async getActiveTokenPair(sub: string) {
    const accessToken = await this.tokensRepository.findOne({
      where: {
        sub: Equal(sub),
        type: TokenType.ACCESS_TOKEN,
        expiredAt: MoreThan(new Date()),
      },
      relations: ['pair'],
    });

    if (!accessToken) {
      this.logger.info('Any active token pair not found', { userId: sub });
      return null;
    }

    this.logger.info(`Active token pair was found`, { accessTokenId: accessToken.id });
    return {
      accessToken: accessToken,
      refreshToken: accessToken.pair,
    };
  }

  async decodeToken(token: string): Promise<string | JwtPayload | null> {
    try {
      return decode(token);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async save(token: Partial<Token>) {
    const instance = plainToInstance(Token, token);
    const errors = await validate(instance);
    if (errors.length) {
      this.logger.error(JSON.stringify(errors));
      throw new InternalServerErrorException();
    }

    const entity = this.tokensRepository.create(token);
    const result = await this.tokensRepository.save(entity);

    this.logger.info('Token was saved', { id: result.id });
    return result;
  }

  async findBySubAndType(sub: string, type: TokenType.ACCESS_TOKEN | TokenType.REFRESH_TOKEN) {
    return await this.tokensRepository.findOne({ where: { sub: Equal(sub), type: Equal(type) } });
  }

  async findByTokenAndType(token: string, type: TokenType.ACCESS_TOKEN | TokenType.REFRESH_TOKEN) {
    return await this.tokensRepository.findOne({
      where: { token: Equal(token), type: Equal(type) },
      relations: ['pair'],
    });
  }

  async findByTokenAndTypeOrThrowError(
    token: string,
    type: TokenType.ACCESS_TOKEN | TokenType.REFRESH_TOKEN,
    errorHandler: () => void,
  ) {
    const entity = await this.findByTokenAndType(token, type);
    if (!entity) errorHandler();
    return entity;
  }

  async findById(id: string) {
    return await this.tokensRepository.findOne({ where: { id: Equal(id) } });
  }

  async update(id: string, attrs: Partial<Token>) {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException(`Token not found. id=${id}`);

    Object.assign(entity, attrs);

    const instance = plainToInstance(Token, entity);
    const errors = await validate(instance);
    if (errors.length) {
      this.logger.error(JSON.stringify(errors));
      throw new InternalServerErrorException();
    }

    const result = await this.save(entity);

    this.logger.info('Token was updated', { id: result.id });
    return result;
  }

  async findBySubAndTypeOrThrowError(
    sub: string,
    type: TokenType.ACCESS_TOKEN | TokenType.REFRESH_TOKEN,
    errorHandler: () => void,
  ) {
    const token = await this.findBySubAndType(sub, type);
    if (!token) errorHandler();
    return token;
  }
}
