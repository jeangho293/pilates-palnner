import { DddService } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { InstructorRepository } from '../infrastructure/instructor.entity';
import { PaginationOptions } from '@libs/utils';
import { StaffRepository } from '@modules/staff/infrastructure/staff.repository';
import { AdminInstructorResponseDto } from '../presentation/dto';

@Injectable()
export class AdminInstructorService extends DddService {
  constructor(
    private readonly instructorRepository: InstructorRepository,
    private readonly staffRepository: StaffRepository
  ) {
    super();
  }

  async search({ keyword, isPublic }: { keyword?: string; isPublic?: boolean }, options?: PaginationOptions) {
    const [instructors, total] = await this.instructorRepository.findAndCount({ keyword, isPublic }, options);

    const staffIds = instructors.map((instructors) => instructors.staffId);

    const staffs = await this.staffRepository.find({ ids: staffIds });

    const staffMap = new Map(staffs.map((staff) => [staff.id, staff]));

    return {
      instructors: instructors.map((instructor) =>
        instructor.toInstance(AdminInstructorResponseDto, { staff: staffMap.get(instructor.staffId) })
      ),
      total,
    };
  }
}
