import { utilities, WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';

export const winstonLogger = WinstonModule.createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.ms(),
        utilities.format.nestLike('OAuth2 server', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
  ],
});
