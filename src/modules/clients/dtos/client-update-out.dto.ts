import { IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ClientDto } from './client.dto';

export class ClientUpdateOutDto {
  @IsNotEmpty()
  @Type(() => ClientDto)
  @ValidateNested()
  @Expose()
  client: ClientDto;

  @IsString()
  @IsNotEmpty()
  @Expose()
  token: string;

  @IsUrl()
  @IsNotEmpty()
  @Expose()
  clientListGetLink: string;

  @IsUrl()
  @IsNotEmpty()
  @Expose()
  updateClientPutLink: string;
}
