import { Base } from '../../common/db/base.entity';
import { Column, OneToMany } from 'typeorm';
import { Scope } from '../scopes/scope.main.entity';
import { IsArray, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MainEntity } from '../../common/db/decorators/main-entity.decorator';

export enum ClientType {
  CONFIDENTIAL = 'confidential',
  PUBLIC = 'public',
}

@MainEntity('clients')
export class Client extends Base {
  @Column({ type: 'enum', enum: ClientType, nullable: false, default: ClientType.CONFIDENTIAL })
  type: ClientType;

  @Column('varchar', { array: true, nullable: false })
  @IsArray()
  @IsUrl({}, { each: true })
  redirectUris: string[];

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  @IsUrl()
  @IsOptional()
  logoLink?: string;

  @OneToMany(() => Scope, (scope) => scope.client, { cascade: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Scope)
  @IsOptional()
  scopes?: Partial<Scope>[];

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  clientSecret?: string;
}

export namespace Client {
  export const Type = ClientType;
}
