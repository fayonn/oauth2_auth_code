import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Oauth2ErrorMessage } from '../../constants/oauth2-error-message.enum';
import { LoggerService } from '../../../logger/logger.service';
import { plainToInstance } from 'class-transformer';
import { AuthorizeInDto } from '../../dtos/authorize-in.dto';

@Catch(Error, HttpException)
export class AuthorizationUnexpectedErrorsFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  constructor() {
    this.logger.setContext(AuthorizationUnexpectedErrorsFilter.name);
  }

  catch(exception: any, host: ArgumentsHost): any {
    this.logger.error(exception);
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    const req: Request = ctx.getRequest();
    const query = plainToInstance(AuthorizeInDto, req.query);
    res.redirect(`${query.redirectUri}?error=${Oauth2ErrorMessage.SERVER_ERROR}`);
  }
}
