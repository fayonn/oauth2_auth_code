import { UseInterceptors } from '@nestjs/common';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';

export const Serialize = (dto: any) => {
  return UseInterceptors(new SerializeInterceptor(dto));
};
