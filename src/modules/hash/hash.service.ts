import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class HashService {
  async createHash(value: string, algorithm: string = 'sha256') {
    return createHash(algorithm).update(value).digest('hex');
  }

  async compareHash(value: string, hash: string, algorithm: string = 'sha256') {
    return (await this.createHash(value, algorithm)) === hash;
  }
}
