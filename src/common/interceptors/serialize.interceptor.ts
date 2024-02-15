import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly dto: any) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        const instance = plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
        return instanceToPlain(instance, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
