import { ResponseDto } from '@libs/utils';
import { StaffStatus } from '@modules/staff/domain/staff.entity';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
class StaffResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  status: StaffStatus;
}

@Exclude()
class BaseInstructorResponseDto extends ResponseDto {
  @Expose()
  id: number;

  @Expose()
  staffId: number;

  @Expose()
  name: string;

  @Expose()
  profileImageUrl: string;

  @Expose()
  career: string;

  @Expose()
  specialties: string[];

  @Expose()
  introduction: string;

  @Expose()
  isPublic: boolean;
}

@Exclude()
export class AdminInstructorResponseDto extends BaseInstructorResponseDto {
  @Expose()
  @Type(() => StaffResponseDto)
  staff: StaffResponseDto;
}
