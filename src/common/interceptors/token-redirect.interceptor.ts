import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class TokenRedirectInterceptor implements NestInterceptor {
  constructor(
    private readonly url: string,
    private readonly status: number,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request: Request = ctx.getRequest();
    const response: Response = ctx.getResponse();
    const token = request.query.token;

    if (!token) {
      throw new BadRequestException('Request does not have token param');
    }

    return next.handle().pipe(
      tap(() => {
        response.redirect(this.status, `${this.url}?token=${token}`);
      }),
    );
  }
}
