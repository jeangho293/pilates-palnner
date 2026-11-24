import type { CalendarDate } from '@libs/types';
import { ResponseDto } from '@libs/utils';
import { StaffRole, StaffStatus } from '@modules/staff/domain/staff.entity';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
class StaffResponseDto extends ResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: StaffRole;

  @Expose()
  status: StaffStatus;

  @Expose()
  lastLoginOn: CalendarDate | null;
}

@Exclude()
export class AdminStaffResponseDto extends StaffResponseDto {}
