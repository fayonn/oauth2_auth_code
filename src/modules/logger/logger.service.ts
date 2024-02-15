import { Injectable, LoggerService as LS, Scope } from '@nestjs/common';
import { winstonLogger } from '../../configs/logger.config';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class LoggerService implements LS {
  private context: string;
  private readonly logger = winstonLogger;

  setContext(context: string) {
    this.context = context;
  }

  debug(message: string): void {
    this.logger.debug(message, this.context);
  }

  error(message: string | Error): void {
    if (message instanceof Error) {
      this.logger.log({
        level: 'error',
        message: message.message,
        stack: (message as Error).stack,
        context: this.context,
      });
    } else if (typeof message === 'string') {
      this.logger.log({
        level: 'error',
        message: message,
        context: this.context,
      });
    }
  }

  fatal(message: string): void {
    this.logger.fatal(message, this.context);
  }

  info(message: string, payload?: object): void {
    this.logger.log(`${message} | payload:${JSON.stringify(payload)}`, this.context);
  }

  log(message: string, context: string): void {
    this.logger.log(`${message}`, context);
  }

  verbose(message: string): void {
    this.logger.verbose(message, this.context);
  }

  warn(message: string): void {
    this.logger.warn(message, this.context);
  }
}
