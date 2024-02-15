import { LoggerService } from './logger.service';
import { Provider } from '@nestjs/common';
import { contextsLogger } from './decorators/logger.decorator';

const loggerFactory = (logger: LoggerService, context: string): LoggerService => {
  logger.setContext(context);
  return logger;
};

const createLoggerProvider = (context: string): Provider<LoggerService> => {
  return {
    provide: `LoggerService${context}`,
    useFactory: (logger) => loggerFactory(logger, context),
    inject: [LoggerService],
  };
};

export const createLoggerProviders = (): Array<Provider<LoggerService>> => {
  return contextsLogger.map((context) => createLoggerProvider(context));
};
