import { ToBoolean } from '@libs/decorators';
import { PaginationDto } from '@libs/utils';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

const INSTRUCTOR_SORT_FIELDS = ['name', 'specialties', 'isPublic', 'createdAt'] as const;
type InstructorSortField = (typeof INSTRUCTOR_SORT_FIELDS)[number];

abstract class BaseInstructorQueryDto extends PaginationDto {
  @IsIn(INSTRUCTOR_SORT_FIELDS)
  @IsOptional()
  declare sort?: InstructorSortField;
}

export class AdminInstructorQueryDto extends BaseInstructorQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
