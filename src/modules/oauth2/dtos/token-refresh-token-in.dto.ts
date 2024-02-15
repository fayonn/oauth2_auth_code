import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

export class TokenRefreshTokenInDto {
  @IsString({ message: '$property must be string' })
  @IsNotEmpty({ message: '$property must not be empty' })
  @IsIn(['refresh_token'], {
    message: "$property must be 'refresh_token'",
  })
  @Expose({ name: 'grant_type' })
  grantType: string;

  @IsString({ message: '$property must be string' })
  @Expose({ name: 'refresh_token' })
  @IsNotEmpty({ message: '$property must not be empty' })
  refreshToken: string;
}
