import { DataSource, Repository } from 'typeorm';
import { Scope } from './scope.main.entity';
import { Injectable } from '@nestjs/common';
import { MainDataSource } from '../../common/db/decorators/main-data-source.decorator';

@Injectable()
export class ScopesRepository extends Repository<Scope> {
  constructor(@MainDataSource() private readonly dataSource: DataSource) {
    super(Scope, dataSource.createEntityManager());
  }
}
