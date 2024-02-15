import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { Oauth2ErrorMessage } from '../../constants/oauth2-error-message.enum';
import { LoggerService } from '../../../logger/logger.service';

@Catch(Error, HttpException)
export class TokenUnexpectedErrorsFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  constructor() {
    this.logger.setContext(TokenUnexpectedErrorsFilter.name);
  }

  catch(exception: any, host: ArgumentsHost): any {
    this.logger.error(exception);
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    const errorBody = {
      error: Oauth2ErrorMessage.SERVER_ERROR,
    };
    res.status(500).send(errorBody);
  }
}
