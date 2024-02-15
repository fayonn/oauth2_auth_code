import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';
import { TokenAuthorizationCodeInDto } from '../dtos/token-authorization-code-in.dto';
import { TokenRefreshTokenInDto } from '../dtos/token-refresh-token-in.dto';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Oauth2ErrorMessage } from '../constants/oauth2-error-message.enum';
import { TokenException } from '../exceptions/token.exception';
import { TokenValidationException } from '../exceptions/token-validation.exception';

@Injectable()
export class TokenGrantTypePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value.grant_type) {
      throw new TokenException({
        title: Oauth2ErrorMessage.UNSUPPORTED_GRANT_TYPE,
        message: 'Unsupported grant type',
        statusCode: 400,
      });
    }

    let response: TokenAuthorizationCodeInDto | TokenRefreshTokenInDto;
    switch (value.grant_type) {
      case 'authorization_code': {
        response = plainToInstance(TokenAuthorizationCodeInDto, value);
        break;
      }
      case 'refresh_token': {
        response = plainToInstance(TokenRefreshTokenInDto, value);
        break;
      }
      default: {
        throw new TokenException({
          title: Oauth2ErrorMessage.UNSUPPORTED_GRANT_TYPE,
          message: 'Unsupported grant type',
          statusCode: 400,
        });
      }
    }

    const errors = validateSync(response);
    if (errors.length > 0) {
      throw new TokenValidationException(errors);
    }

    return response;
  }
}
