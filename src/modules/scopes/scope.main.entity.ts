import { Base } from '../../common/db/base.entity';
import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from '../clients/client.main.entity';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MainEntity } from '../../common/db/decorators/main-entity.decorator';

@MainEntity('scopes')
export class Scope extends Base {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

  @ManyToOne(() => Client, (client) => client.scopes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @ValidateNested()
  @Type(() => Client)
  client: Client;
}
