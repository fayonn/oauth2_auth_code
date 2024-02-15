import { IsArray, IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ClientDto } from '../../clients/dtos/client.dto';

export class AdminPageOutDto {
  @IsNotEmpty()
  @IsArray()
  @Type(() => ClientDto)
  @Expose()
  @ValidateNested({ each: true })
  clients: ClientDto[];

  @IsString()
  @IsNotEmpty()
  @Expose()
  token: string;

  @IsUrl()
  @IsNotEmpty()
  @Expose()
  createClientGetLink: string;

  @IsUrl()
  @IsNotEmpty()
  @Expose()
  infoClientGetLink: string;

  @IsUrl()
  @IsNotEmpty()
  @Expose()
  updateClientGetLink: string;

  @IsUrl()
  @IsNotEmpty()
  @Expose()
  deleteClientDeleteLink: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  publicKey: string;
}
