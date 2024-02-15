import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { VIEW } from '../constants/view.enum';
import { LoggerService } from '../../modules/logger/logger.service';

@Catch(Error, HttpException)
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  constructor() {
    this.logger.setContext(ErrorFilter.name);
  }

  catch(exception: any, host: ArgumentsHost): any {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    // if (exception.error === 'Forbidden') {
    //   let html = readFileSync(join(process.cwd(), '/views/error.hbs')).toString();
    //   html = html.replace('{{error}}', 'Forbidden');
    //   html = html.replace('{{error_description}}', exception.message);
    //   res.status(500).send({ error: true, html: html });
    //   return;
    // }

    const templateData = {
      error: 'Internal Server Error',
      error_description: 'Something went wrong',
    };

    if (exception.response.error === 'Forbidden') {
      templateData.error = 'Forbidden';
      templateData.error_description = exception.response.message;
    }

    res.render(VIEW.ERROR, templateData);
  }
}
