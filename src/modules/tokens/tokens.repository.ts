import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Token } from './token.main.entity';
import { MainDataSource } from '../../common/db/decorators/main-data-source.decorator';
import { TransactionService } from '../../common/db/transaction.service';

@Injectable()
export class TokensRepository extends Repository<Token> {
  readonly transaction = new TransactionService<Token>(Token);

  constructor(@MainDataSource() private readonly dataSource: DataSource) {
    super(Token, dataSource.createEntityManager());
  }
}
