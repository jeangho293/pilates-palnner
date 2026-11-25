import { ToBoolean } from '@libs/decorators';
import { IsBoolean } from 'class-validator';

export class InstructorChangePublicDto {
  @ToBoolean()
  @IsBoolean()
  isPublic: boolean;
}
