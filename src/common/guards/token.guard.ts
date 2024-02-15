import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TokensService } from '../../modules/tokens/tokens.service';
import { ConfigService } from '@nestjs/config';
import { TokenType } from '../../modules/tokens/constants/token-type.enum';
import { Reflector } from '@nestjs/core';
import { TokenTypeReflector } from '../decorators/token-type-reflector.decorator';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokensService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const publicKey = this.configService.getOrThrow<string>('JWT_PUBLIC_KEY');
    const tokenTypes =
      this.reflector.get<TokenType[]>(TokenTypeReflector, context.getClass()) ||
      this.reflector.get<TokenType[]>(TokenTypeReflector, context.getHandler());

    let token: string;
    const query = request.query;
    const body = request.body;

    if (query && query.token) {
      token = query.token as string;
    } else if (body.token) {
      token = body.token;
    } else {
      return false;
    }

    for (const type of tokenTypes) {
      if (await this.tokenService.verifyToken(token, publicKey, type)) return true;
    }

    return false;
  }
}
