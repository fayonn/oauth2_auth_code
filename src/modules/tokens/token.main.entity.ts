import { MainEntity } from '../../common/db/decorators/main-entity.decorator';
import { Base } from '../../common/db/base.entity';
import { Column, JoinColumn, OneToOne } from 'typeorm';
import { TokenType } from './constants/token-type.enum';
import { IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@MainEntity('tokens')
export class Token extends Base {
  @Column({
    type: 'enum',
    enum: [TokenType.ACCESS_TOKEN, TokenType.REFRESH_TOKEN],
    nullable: false,
  })
  type: TokenType;

  @OneToOne(() => Token, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pairId' })
  @ValidateNested()
  @Type(() => Token)
  pair: Token;

  @Column({ nullable: false })
  token: string;

  @Column({ type: 'jsonb', nullable: false })
  payload: object;

  @Column({ nullable: false, type: 'timestamptz' })
  expiredAt: Date;

  @Column({ nullable: false })
  @IsUUID()
  sub: string;
}
