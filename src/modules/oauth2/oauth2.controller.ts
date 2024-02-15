import { Body, Controller, Get, Post, Query, Render, Res, UseFilters, UsePipes } from '@nestjs/common';
import { VIEW } from '../../common/constants/view.enum';
import { BASE_URL } from '../../common/constants/constants';
import { AuthorizeInDto } from './dtos/authorize-in.dto';
import { Oauth2Service } from './oauth2.service';
import { Oauth2Validation } from './decorators/oauth2-validation.decorator';
import { Oauth2LoginInDto } from './dtos/oauth2-login-in.dto';
import { Response } from 'express';
import { TokensService } from '../tokens/tokens.service';
import { TokenType } from '../tokens/constants/token-type.enum';
import { ConfigService } from '@nestjs/config';
import { AuthorizeOutDto } from './dtos/authorize-out.dto';
import { formAuthorizationQueryParams } from './functions/form-authorization-request';
import { TokenizeAuthorizeInDto } from './dtos/tokenize-authorize-in.dto';
import { ConsentInDto } from './dtos/consent-in.dto';
import { UsersService } from '../users/users.service';
import { Oauth2ErrorMessage } from './constants/oauth2-error-message.enum';
import { TokenFilter } from './filters/token/token.filter';
import { TokenValidationFilter } from './filters/token/token-validation.filter';
import { TokenGrantTypePipe } from './pipes/token-grant-type.pipe';
import { AuthorizationException } from './exceptions/authorization.exception';
import { ClientsService } from '../clients/clients.service';
import { ConsentPermissionInDto } from './dtos/consent-permission-in.dto';
import { Serialize } from '../../common/decorators/serialize.decorator';
import { TokenOutDto } from './dtos/token-out.dto';
import { Token } from '../tokens/token.main.entity';
import { TokenUnexpectedErrorsFilter } from './filters/token/token-unexpected-errors.filter';
import { Logger } from '../logger/decorators/logger.decorator';
import { LoggerService } from '../logger/logger.service';
import { AuthorizationRequestUtils } from './decorators/authorization-request-utils';
import { TokenAuthDecorator } from '../../common/decorators/token-auth.decorator';

@Controller({
  path: 'oauth2',
  version: '1',
})
@Oauth2Validation()
export class Oauth2Controller {
  constructor(
    private readonly oauth2Service: Oauth2Service,
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
    private readonly tokenService: TokensService,
    private readonly configService: ConfigService,
    @Logger(Oauth2Controller.name) private readonly logger: LoggerService,
  ) {}

  @Get('authorize')
  @Render(VIEW.LOGIN)
  // @QueryTransform(AuthorizeInDto)
  // @UsePipes(InnerAuthorizationRequestPipe)
  // @UseFilters(AuthorizationUnexpectedErrorsFilter, AuthorizationFilter, AuthorizationValidationFilter)
  @AuthorizationRequestUtils()
  async loginRender(@Query() query: AuthorizeInDto): Promise<AuthorizeOutDto> {
    const innerTokenLifetimeInMinutes = +this.configService.getOrThrow<number>('JWT_INNER_LIFETIME_MINUTES');

    const innerToken = await this.tokenService.generateToken(
      { sub: 'INNER' },
      TokenType.INNER_TOKEN,
      innerTokenLifetimeInMinutes * 60,
    );

    return {
      ...query,
      loginPostLink: `${BASE_URL}/v1/oauth2/authorize?token=${innerToken}&${formAuthorizationQueryParams(query)}`,
    };
  }

  @Post('authorize')
  // @UseGuards(TokenGuard)
  // @TokenTypeReflector([TokenType.INNER_TOKEN])
  @TokenAuthDecorator([TokenType.INNER_TOKEN])
  @AuthorizationRequestUtils()
  async login(@Res() res: Response, @Query() query: TokenizeAuthorizeInDto, @Body() body: Oauth2LoginInDto) {
    await this.oauth2Service.authorize(body.email, body.password);

    res
      .status(303)
      .redirect(
        `${BASE_URL}/v1/oauth2/consent?email=${encodeURIComponent(body.email)}&token=${
          query.token
        }&${formAuthorizationQueryParams(query)}`,
      );
  }

  @Get('consent')
  @TokenAuthDecorator([TokenType.INNER_TOKEN])
  @Render(VIEW.CONSENT)
  @AuthorizationRequestUtils()
  async consentRender(@Query() query: ConsentInDto) {
    const client = await this.clientsService.findByIdOrThrowError(query.clientId, () => {
      throw new AuthorizationException({
        title: Oauth2ErrorMessage.INVALID_CLIENT,
        message: 'Client not found',
        statusCode: 404,
        property: 'clientId',
      });
    });

    return {
      ...query,
      scopes: query.scope,
      client: client,
      consentPostLink: `${BASE_URL}/v1/oauth2/consent?email=${encodeURIComponent(query.email)}&token=${
        query.token
      }&${formAuthorizationQueryParams(query)}`,
    };
  }

  @Post('consent')
  @TokenAuthDecorator([TokenType.INNER_TOKEN])
  @AuthorizationRequestUtils()
  async consent(@Res() res: Response, @Query() query: ConsentInDto, @Body() body: ConsentPermissionInDto) {
    if (!body.permission) {
      this.logger.warn('User decline consent');
      let redirectUrl = `${query.redirectUri}?error=${Oauth2ErrorMessage.ACCESS_DENIED}`;
      if (query.state) {
        redirectUrl += `&state=${query.state}`;
      }
      return res.redirect(redirectUrl);
    }

    const client = await this.clientsService.findByIdOrThrowError(query.clientId, () => {
      throw new AuthorizationException({
        title: Oauth2ErrorMessage.INVALID_CLIENT,
        message: 'Client not found',
        statusCode: 404,
        property: 'clientId',
      });
    });

    const user = await this.usersService.findByEmailOrThrowError(query.email, () => {
      throw new AuthorizationException({
        title: Oauth2ErrorMessage.SERVER_ERROR,
        message: 'User not found',
        statusCode: 500,
      });
    });

    const authCode = await this.oauth2Service.handleConsent(client, user, query.redirectUri, query.scope);
    return res.redirect(`${query.redirectUri}?code=${authCode.code}`);
  }

  @Post('token')
  @UsePipes(TokenGrantTypePipe)
  @Serialize(TokenOutDto)
  @UseFilters(TokenUnexpectedErrorsFilter, TokenFilter, TokenValidationFilter)
  async token(@Query() query: any): Promise<Partial<TokenOutDto>> {
    let res: { accessToken: Token; refreshToken: Token };

    switch (query.grantType) {
      case 'authorization_code': {
        res = await this.oauth2Service.handleAccessToken(query.code, query.redirectUri, query.clientId);
        break;
      }
      case 'refresh_token': {
        res = await this.oauth2Service.handleRefreshToken(query.refreshToken);
        break;
      }
    }

    return {
      accessToken: res.accessToken.token,
      refreshToken: res.refreshToken.token,
    };
  }
}
