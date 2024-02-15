import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TokenValidationException } from '../../exceptions/token-validation.exception';
import { Response } from 'express';
import { Oauth2ErrorMessage } from '../../constants/oauth2-error-message.enum';
import { LoggerService } from '../../../logger/logger.service';

@Catch(TokenValidationException)
export class TokenValidationFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  constructor() {
    this.logger.setContext(TokenValidationFilter.name);
  }

  catch(exception: TokenValidationException, host: ArgumentsHost): any {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();

    const error = exception.validations[0];
    const constraints = Object.keys(error.constraints).map((key) => error.constraints[key]);
    const errorBody = {
      error: Oauth2ErrorMessage.INVALID_REQUEST,
      error_description: constraints[0],
    };

    if (error.property === 'grantType') {
      errorBody.error = Oauth2ErrorMessage.INVALID_GRANT;
    }

    res.status(400).send(errorBody);
  }
}
