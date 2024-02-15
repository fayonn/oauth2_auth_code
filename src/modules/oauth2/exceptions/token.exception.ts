import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class TokenException extends HttpException {
  public readonly title: string;
  public readonly message: string;
  public readonly statusCode: number;
  public readonly error: any;

  constructor(
    args: {
      title: string;
      message: string;
      statusCode: number;
    },
    options?: HttpExceptionOptions,
  ) {
    super(args.message, args.statusCode, options);

    this.title = args.title;
    this.message = args.message;
    this.statusCode = args.statusCode;
  }
}
