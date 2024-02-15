import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TokenException } from '../../exceptions/token.exception';
import { Response } from 'express';
import { LoggerService } from '../../../logger/logger.service';

@Catch(TokenException)
export class TokenFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  constructor() {
    this.logger.setContext(TokenFilter.name);
  }

  catch(exception: TokenException, host: ArgumentsHost): any {
    this.logger.error(exception);
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    res.status(exception.statusCode).send({
      error: exception.title,
      error_description: exception.message,
    });
  }
}
