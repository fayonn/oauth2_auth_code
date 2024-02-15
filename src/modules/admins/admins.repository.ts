import { DataSource, Repository } from 'typeorm';
import { Admin } from './admin.main.entity';
import { Injectable } from '@nestjs/common';
import { MainDataSource } from '../../common/db/decorators/main-data-source.decorator';

@Injectable()
export class AdminsRepository extends Repository<Admin> {
  constructor(@MainDataSource() private readonly dataSource: DataSource) {
    super(Admin, dataSource.createEntityManager());
  }
}
