import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { AuthorizationException } from '../../exceptions/authorization.exception';
import { Request, Response } from 'express';
import { VIEW } from '../../../../common/constants/view.enum';
import { LoggerService } from '../../../logger/logger.service';
import { plainToInstance } from 'class-transformer';
import { AuthorizeInDto } from '../../dtos/authorize-in.dto';

@Catch(AuthorizationException)
export class AuthorizationFilter implements ExceptionFilter {
  private readonly NOT_REDIRECTING_FIELDS = {
    redirectUri: 'Invalid request',
    clientId: 'Invalid request',
  };
  private readonly logger = new LoggerService();

  constructor() {
    this.logger.setContext(AuthorizationFilter.name);
  }

  catch(exception: AuthorizationException, host: ArgumentsHost): any {
    this.logger.error(exception);
    const ctx = host.switchToHttp();
    const req: Request = ctx.getRequest();
    const res: Response = ctx.getResponse();
    const query = plainToInstance(AuthorizeInDto, req.query);

    // Спочатку ідентифікуємо чи є помилки, котрі не потрібно перенаправляти
    // Такі помилки виводимо окремою сторінкою
    if (Object.keys(this.NOT_REDIRECTING_FIELDS).includes(exception.property)) {
      this.logger.info('Not redirecting error');
      this.handleNotRedirectingError(exception, res);
    } else {
      // Якщо таких помилок нема, то беремо першу помилку із масиву і перенаправляємо її
      this.logger.info('Redirecting error');
      this.handleRedirectingError(exception, query, res);
    }
  }

  private handleNotRedirectingError(error: AuthorizationException, res: Response): void {
    const templateData = {
      error: error.title,
      error_description: error.message,
    };

    res.render(VIEW.ERROR, templateData);
  }

  private handleRedirectingError(error: AuthorizationException, query: AuthorizeInDto, res: Response): void {
    let redirectUri = `${query.redirectUri}?`;
    redirectUri += `error=${encodeURIComponent(error.title)}&error_description=${encodeURIComponent(error.message)}`;
    if (query.state) {
      redirectUri += `&state=${query.state}`;
    }

    res.redirect(redirectUri);
  }
}
