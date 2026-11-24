import { DddService } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { StaffRepository } from '../infrastructure/staff.repository';
import { PaginationOptions } from '@libs/utils';
import { StaffStatus } from '../domain/staff.entity';
import { AdminStaffResponseDto } from '../presentation/dto';
import { StaffNotFoundException } from '../domain/exception';

@Injectable()
export class AdminStaffService extends DddService {
  constructor(private readonly staffRepository: StaffRepository) {
    super();
  }

  async list() {}

  async search({ statuses, keyword }: { statuses?: StaffStatus[]; keyword?: string }, options?: PaginationOptions) {
    const [staffs, total] = await this.staffRepository.findAndCount({ statuses, keyword }, options);

    return { staffs: staffs.map((staff) => staff.toInstance(AdminStaffResponseDto)), total };
  }

  async retrieve({ id }: { id: number }) {
    const [staff] = await this.staffRepository.find({ ids: [id] });

    if (!staff) {
      throw new StaffNotFoundException(id);
    }

    return staff.toInstance(AdminStaffResponseDto);
  }

  async changeName({ id, name }: { id: number; name: string }) {
    const [staff] = await this.staffRepository.find({ ids: [id] });

    if (!staff) {
      throw new StaffNotFoundException(id);
    }

    staff.update({ name });

    await this.staffRepository.save([staff]);
  }
}
