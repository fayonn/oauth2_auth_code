import { Base } from '../../common/db/base.entity';
import { BeforeInsert, BeforeUpdate, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsHash, validate } from 'class-validator';
import { InternalServerErrorException } from '@nestjs/common';
import { MainEntity } from '../../common/db/decorators/main-entity.decorator';

@MainEntity('admins')
export class Admin extends Base {
  @Column({ unique: true, nullable: false })
  @IsEmail()
  email: string;

  @Column({ nullable: false })
  @IsHash('sha256')
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  private async beforeInsertOrUpdate() {
    const errors = await validate(this);
    if (errors.length > 0) throw new InternalServerErrorException('ADD');
  }
}
