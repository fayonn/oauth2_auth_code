import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ScopeDto } from '../../scopes/dtos/scope.dto';

// todo test nested validation
export class ClientUpdateInDto {
  @IsOptional()
  @IsUUID()
  @Expose()
  id?: string;

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

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Expose()
  @Type(() => ScopeDto)
  scopes: ScopeDto[];
}
