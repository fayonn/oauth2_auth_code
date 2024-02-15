import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { Client, ClientType } from '../client.main.entity';
import { ScopeDto } from '../../scopes/dtos/scope.dto';

export class ClientDto {
  @IsOptional()
  @IsUUID()
  @Expose()
  id?: string;

  @IsEnum(Client.Type)
  @IsOptional()
  @Expose()
  type: ClientType;

  @IsArray()
  @IsUrl({}, { each: true })
  @Expose()
  redirectUris: string[];

  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @IsUrl()
  @IsOptional()
  @Expose()
  logoLink?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Expose()
  @Type(() => ScopeDto)
  scopes: ScopeDto[];

  @IsString()
  @IsOptional()
  clientSecret: string;
}
