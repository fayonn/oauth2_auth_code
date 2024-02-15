import { Inject } from '@nestjs/common';

export const contextsLogger: string[] = [];

export const Logger = (context: string) => {
  if (!contextsLogger.includes(context)) {
    contextsLogger.push(context);
  }

  return Inject(`LoggerService${context}`);
};
