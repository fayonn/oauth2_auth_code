import { Module } from '@nestjs/common';
import { AuthorizationCodesService } from './authorization-codes.service';
import { AuthorizationCodesRepository } from './authorization-codes.repository';
import { AuthorizationCodeSubscriber } from './subscribers/authorization-code.subscriber';

@Module({
  providers: [AuthorizationCodesService, AuthorizationCodesRepository, AuthorizationCodeSubscriber],
  exports: [AuthorizationCodesService],
})
export class AuthorizationCodesModule {}
