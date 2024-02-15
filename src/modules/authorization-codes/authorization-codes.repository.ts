import { DataSource, Equal, LessThan, MoreThan, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AuthorizationCode } from './authorization-code.main.entity';
import { MainDataSource } from '../../common/db/decorators/main-data-source.decorator';
import { TransactionService } from '../../common/db/transaction.service';

@Injectable()
export class AuthorizationCodesRepository extends Repository<AuthorizationCode> {
  readonly transaction = new TransactionService<AuthorizationCode>(AuthorizationCode);

  constructor(@MainDataSource() private readonly dataSource: DataSource) {
    super(AuthorizationCode, dataSource.createEntityManager());
  }

  async getActiveOne(options: { clientId: string; userId: string }) {
    return await this.findOne({
      where: {
        expiresAt: MoreThan(new Date()),
        isUsed: false,
        client: { id: Equal(options.clientId) },
        userId: Equal(options.userId),
      },
    });
  }
}
