import { DddRepository } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Staff, StaffStatus } from '../domain/staff.entity';
import { applyLikeSearch, applyPagination, PaginationOptions } from '@libs/utils';

@Injectable()
export class StaffRepository extends DddRepository<Staff> {
  entityClass = Staff;

  async find() {}

  async count() {}

  async findAndCount(conditions: { statuses?: StaffStatus[]; keyword?: string }, options?: PaginationOptions) {
    const query = this.createQueryBuilder('staff');

    if (conditions.statuses?.length) {
      query.andWhere('staff.status IN (:...statuses)', { statuses: conditions.statuses });
    }

    const likeSearch = applyLikeSearch(
      query,
      { name: 'staff.name', email: 'staff.email' },
      ['name', 'email'],
      conditions.keyword
    );

    return applyPagination(likeSearch, options).getManyAndCount();
  }
}
