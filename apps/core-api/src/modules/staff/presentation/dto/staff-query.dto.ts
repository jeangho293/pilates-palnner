import { ToArray } from '@libs/decorators';
import { PaginationDto } from '@libs/utils';
import { StaffStatus } from '@modules/staff/domain/staff.entity';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

const STAFF_SORT_FIELDS = ['name', 'email', 'role', 'status', 'lastLoginOn', 'createdAt'] as const;
type StaffSortField = (typeof STAFF_SORT_FIELDS)[number];

class BaseStaffQueryDto extends PaginationDto {
  @IsIn(STAFF_SORT_FIELDS)
  @IsOptional()
  declare sort?: StaffSortField;
}

export class AdminStaffQueryDto extends BaseStaffQueryDto {
  @ToArray()
  @IsEnum(StaffStatus, { each: true })
  @IsOptional()
  statuses?: StaffStatus[];

  @IsString()
  @IsOptional()
  keyword?: string;
}
