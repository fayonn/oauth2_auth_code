import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../../modules/logger/logger.service';
import { Logger } from '../../modules/logger/decorators/logger.decorator';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(@Logger(RequestLoggerMiddleware.name) private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = new Date();
    this.logger.info('(Start) request', {
      method: req.method,
      url: req.baseUrl,
      startTime: startTime.toUTCString(),
      ip: req.ip,
      body: req.body,
      query: req.query,
    });

    res.on('close', () => {
      const finishTime = new Date();
      this.logger.info('(Finish) request', {
        method: req.method,
        url: req.baseUrl,
        finishTime: finishTime.toUTCString(),
        time: finishTime.getTime() - startTime.getTime(),
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
      });
    });

    next();
  }
}
