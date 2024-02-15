import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { AuthorizationValidationException } from '../../exceptions/authorization-validation.exception';
import { Request, Response } from 'express';
import { VIEW } from '../../../../common/constants/view.enum';
import { ValidationError } from 'class-validator';
import { Oauth2ErrorMessage } from '../../constants/oauth2-error-message.enum';
import { LoggerService } from '../../../logger/logger.service';

@Catch(AuthorizationValidationException)
export class AuthorizationValidationFilter implements ExceptionFilter {
  private readonly NOT_REDIRECTING_FIELDS = {
    redirectUri: 'Invalid request',
    clientId: 'Invalid request',
  };
  private readonly logger = new LoggerService();

  constructor() {
    this.logger.setContext(AuthorizationValidationFilter.name);
  }

  catch(exception: AuthorizationValidationException, host: ArgumentsHost): any {
    this.logger.error(exception);
    const ctx = host.switchToHttp();
    const req: Request = ctx.getRequest();
    const res: Response = ctx.getResponse();

    // Спочатку ідентифікуємо чи є помилки, котрі не потрібно перенаправляти
    // Такі помилки виводимо окремою сторінкою
    const notRedirectingErrors = exception.validations.filter((item) =>
      Object.keys(this.NOT_REDIRECTING_FIELDS).includes(item.property),
    );

    if (!!notRedirectingErrors.length) {
      this.handleNotRedirectingError(notRedirectingErrors[0], res);
    } else {
      // Якщо таких помилок нема, то беремо першу помилку із масиву і перенаправляємо її
      const error = exception.validations[0];
      this.handleRedirectingError(error, req, res);
    }
  }

  private handleNotRedirectingError(error: ValidationError, res: Response): void {
    const constraints = Object.keys(error.constraints)
      .map((key) => error.constraints[key])
      .reduce((value, result) => result + `\n${value}`, '');

    const templateData = {
      error: this.NOT_REDIRECTING_FIELDS[error.property] || 'Internal Server Error',
      error_description: constraints,
    };

    res.render(VIEW.ERROR, templateData);
  }

  private handleRedirectingError(error: ValidationError, req: Request, res: Response): void {
    const constraints = Object.keys(error.constraints).map((key) => error.constraints[key]);
    let redirectUri = `${error.target['redirectUri']}?`;

    if (error.property === 'responseType' && error.constraints['isIn']) {
      redirectUri += `error=${Oauth2ErrorMessage.UNSUPPORTED_RESPONSE_TYPE}&error_description=${encodeURIComponent(
        error.constraints['isIn'],
      )}`;
    } else {
      redirectUri += `error=${encodeURIComponent(
        Oauth2ErrorMessage.INVALID_REQUEST,
      )}&error_description=${encodeURIComponent(constraints[0])}`;
    }

    if (req.query.state) {
      redirectUri += `&state=${req.query.state}`;
    }

    res.redirect(redirectUri);
  }
}
