import { InternalServerErrorException, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthorizationValidationException } from '../exceptions/authorization-validation.exception';
import { AuthorizeInDto } from '../dtos/authorize-in.dto';
import { Oauth2LoginInDto } from '../dtos/oauth2-login-in.dto';
import { ConsentInDto } from '../dtos/consent-in.dto';
import { TokenAuthorizationCodeInDto } from '../dtos/token-authorization-code-in.dto';
import { TokenValidationException } from '../exceptions/token-validation.exception';
import { TokenizeAuthorizeInDto } from '../dtos/tokenize-authorize-in.dto';

export function Oauth2Validation() {
  return UsePipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      transform: true,
      exceptionFactory: (errors) => {
        switch (errors[0].target.constructor) {
          case AuthorizeInDto:
          case Oauth2LoginInDto:
          case TokenizeAuthorizeInDto:
          case ConsentInDto: {
            return new AuthorizationValidationException(errors);
          }
          case TokenAuthorizationCodeInDto: {
            return new TokenValidationException(errors);
          }
          default: {
            return new InternalServerErrorException('Unsupported DTO');
          }
        }
      },
    }),
  );
}
