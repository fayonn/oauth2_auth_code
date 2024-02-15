import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { Expose } from 'class-transformer';

export class ClientCreateOutDto {
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
  createClientPostLink: string;
}
