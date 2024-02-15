import { DataSource, Repository } from 'typeorm';
import { Client } from './client.main.entity';
import { Injectable } from '@nestjs/common';
import { MainDataSource } from '../../common/db/decorators/main-data-source.decorator';

@Injectable()
export class ClientsRepository extends Repository<Client> {
  constructor(@MainDataSource() private readonly dataSource: DataSource) {
    super(Client, dataSource.createEntityManager());
  }
}
