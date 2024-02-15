import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class AuthorizationException extends HttpException {
  public readonly title: string;
  public readonly message: string;
  public readonly statusCode: number;
  public readonly redirectUri?: string;
  public readonly property?: string; // field name

  constructor(
    args: {
      title: string;
      message: string;
      redirectUri?: string;
      property?: string;
      statusCode: number;
    },
    options?: HttpExceptionOptions,
  ) {
    super(args.message, args.statusCode, options);

    this.title = args.title;
    this.message = args.message;
    this.redirectUri = args.redirectUri;
    this.property = args.property;
    this.statusCode = args.statusCode;
  }
}
