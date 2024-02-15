import { IsBoolean, IsNotEmpty } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class ConsentPermissionInDto {
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  @Transform((param) => param.value === 'true')
  permission: string;
}
