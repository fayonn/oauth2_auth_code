import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenOutDto {
  @Expose({ toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @Expose({ toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @Expose({ toPlainOnly: true })
  @IsString()
  @IsNotEmpty()
  get access_token() {
    return this.accessToken;
  }

  @Expose({ toPlainOnly: true })
  @IsString()
  @IsNotEmpty()
  get refresh_token() {
    return this.refreshToken;
  }
}
