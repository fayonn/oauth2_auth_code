import { IsIn, IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export class TokenAuthorizationCodeInDto {
  @IsString({ message: '$property must be string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @IsIn(['authorization_code'], {
    message: "$property must be 'authorization_code'",
  })
  @Expose({ name: 'grant_type' })
  grantType: string;

  @IsString({ message: '$property must be string' })
  @Expose()
  @IsNotEmpty({ message: '$property must not be empty' })
  code: string;

  @IsUrl({}, { message: '$property must be url' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Expose({ name: 'redirect_uri' })
  redirectUri: string;

  @IsUUID(undefined, { message: '$property must be uuid' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @Expose({ name: 'client_id' })
  clientId: string;
}
