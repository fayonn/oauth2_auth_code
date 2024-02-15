import { MainEntity } from '../../common/db/decorators/main-entity.decorator';
import { Column, ManyToOne } from 'typeorm';
import { Base } from '../../common/db/base.entity';
import { Client } from '../clients/client.main.entity';
import { IsArray, IsOptional, IsUrl, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@MainEntity('authorization_codes')
export class AuthorizationCode extends Base {
  @Column({ nullable: false })
  code: string;

  @ManyToOne(() => Client, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @ValidateNested()
  @Type(() => Client)
  client: Client;

  @Column({ nullable: false })
  @IsUUID()
  userId: string;

  @Column({ nullable: false, type: 'timestamptz' })
  expiresAt: Date;

  @Column({ nullable: false })
  @IsUrl()
  redirectUri: string;

  @Column({ nullable: false, default: false })
  isUsed: boolean;

  @Column('varchar', { array: true, default: [] })
  @IsArray()
  @IsOptional()
  scopes: string[];
}
