import { IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { AuthorizeInDto } from './authorize-in.dto';

export class TokenizeAuthorizeInDto extends AuthorizeInDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  token: string;
}
