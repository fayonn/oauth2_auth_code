import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class QueryTransformPipe implements PipeTransform {
  constructor(private readonly dto: any) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'query') {
      return plainToInstance(this.dto, value);
    }

    return value;
  }
}
