import { UseInterceptors } from '@nestjs/common';
import { TokenRedirectInterceptor } from '../interceptors/token-redirect.interceptor';

export function TokenRedirect(url: string, status: number = 302) {
  return UseInterceptors(new TokenRedirectInterceptor(url, status));
}
