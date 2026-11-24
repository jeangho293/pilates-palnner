import { DddService } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { StaffRepository } from '../infrastructure/staff.repository';
import { PaginationOptions } from '@libs/utils';
import { StaffStatus } from '../domain/staff.entity';

@Injectable()
export class AdminStaffService extends DddService {
  constructor(private readonly staffRepository: StaffRepository) {
    super();
  }

  async list() {}

  async search({ statuses, keyword }: { statuses?: StaffStatus[]; keyword?: string }, options?: PaginationOptions) {
    const [staffs, total] = await this.staffRepository.findAndCount({ statuses, keyword }, options);

    return { staffs, total };
  }
}
