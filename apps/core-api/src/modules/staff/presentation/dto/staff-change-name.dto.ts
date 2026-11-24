import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class StaffChangeNameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @Transform(({ value }) => value?.trim())
  name: string;
}
