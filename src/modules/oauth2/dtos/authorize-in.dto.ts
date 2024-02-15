import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class AuthorizeInDto {
  @IsString({ message: '$property must be string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @IsIn(['code'], { message: "$property must be 'code'" })
  @Expose({ name: 'response_type' })
  responseType: string;

  @IsUUID(undefined, { message: '$property must be uuid' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Expose({ name: 'client_id' })
  clientId: string;

  @IsUrl({}, { message: '$property must be url' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Expose({ name: 'redirect_uri' })
  redirectUri: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Transform((param) => (!Array.isArray(param.value) ? param.value.split(',') : param.value))
  scope?: string[];

  @IsString({ message: '$property must be string' })
  @IsOptional()
  @IsNotEmpty({ message: '$property must not be empty' })
  state?: string;
}
