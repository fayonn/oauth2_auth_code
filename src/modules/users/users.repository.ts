import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './user.users.entity';
import { UsersDataSource } from '../../common/db/decorators/users-data-source.decorator';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(@UsersDataSource() private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
}
