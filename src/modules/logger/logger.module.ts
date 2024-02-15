import { DynamicModule } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { createLoggerProviders } from './logger.provider';

export class LoggerModule {
  static forRoot({ isGlobal = false, ...rest }: { isGlobal?: boolean }): DynamicModule {
    const contextLoggerProviders = createLoggerProviders();
    return {
      module: LoggerModule,
      providers: [LoggerService, ...contextLoggerProviders],
      exports: [LoggerService, ...contextLoggerProviders],
      global: isGlobal,
    };
  }
}
