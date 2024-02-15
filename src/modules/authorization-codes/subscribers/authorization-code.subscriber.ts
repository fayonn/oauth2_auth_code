import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { AuthorizationCode } from '../authorization-code.main.entity';
import { MainDataSource } from '../../../common/db/decorators/main-data-source.decorator';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { AuthorizationCodesRepository } from '../authorization-codes.repository';
import { SHA1, enc } from 'crypto-js';

@EventSubscriber()
export class AuthorizationCodeSubscriber implements EntitySubscriberInterface<AuthorizationCode> {
  constructor(
    @MainDataSource() private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly authorizationCodesRepository: AuthorizationCodesRepository,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return AuthorizationCode;
  }

  async beforeInsert(event: InsertEvent<AuthorizationCode>) {
    const randomString = (Math.random() + 1).toString(36).substring(2);
    event.entity.code = SHA1(randomString).toString(enc.Hex);

    const authCodeLifeTime = +this.configService.getOrThrow<number>('AUTHORIZATION_CODE_LIFETIME_MINUTES');
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() - authCodeLifeTime);

    const activeAuthCode = await this.authorizationCodesRepository.getActiveOne({
      clientId: event.entity.client.id,
      userId: event.entity.userId,
    });

    if (activeAuthCode) {
      throw new ConflictException('Authorization code is still active');
    }
  }
}
