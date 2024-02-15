import { IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ClientDto } from './client.dto';

export class ClientInfoOutDto {
  @IsNotEmpty()
  @Type(() => ClientDto)
  @Expose()
  @ValidateNested()
  client: ClientDto;

  @IsString()
  @IsNotEmpty()
  @Expose()
  token: string;

  @IsUrl()
  @IsNotEmpty()
  @Expose()
  clientListGetLink: string;
}
