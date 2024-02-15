import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { AuthorizeInDto } from './authorize-in.dto';

export class ConsentInDto extends AuthorizeInDto {
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  token: string;
}
