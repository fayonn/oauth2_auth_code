import { IsNotEmpty, IsUrl } from 'class-validator';
import { Expose } from 'class-transformer';
import { AuthorizeInDto } from './authorize-in.dto';

export class AuthorizeOutDto extends AuthorizeInDto {
  @IsUrl()
  @IsNotEmpty()
  @Expose()
  loginPostLink: string;
}
