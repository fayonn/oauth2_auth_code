import { Column } from 'typeorm';
import { Base } from '../../common/db/base.entity';
import { IsEmail, IsHash } from 'class-validator';
import { UsersEntity } from '../../common/db/decorators/users-entity.decorator';

@UsersEntity('users')
export class User extends Base {
  @Column({ unique: true, nullable: false })
  @IsEmail()
  email: string;

  @Column({ nullable: false })
  @IsHash('sha256')
  password: string;
}
