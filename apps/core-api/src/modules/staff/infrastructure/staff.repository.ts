import { DddRepository } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Staff, StaffStatus } from '../domain/staff.entity';
import {
  applyLikeSearch,
  applyPagination,
  checkInValue,
  convertOptions,
  PaginationOptions,
  TypeormRelationOptions,
} from '@libs/utils';

@Injectable()
export class StaffRepository extends DddRepository<Staff> {
  entityClass = Staff;

  async find(conditions: { ids?: number[] }, options?: TypeormRelationOptions<Staff>) {
    return this.entityManager.find(this.entityClass, {
      where: {
        id: checkInValue(conditions.ids),
      },
      ...convertOptions(options),
    });
  }

  async count(conditions: { ids?: number[] }) {
    return this.entityManager.count(this.entityClass, {
      where: {
        id: checkInValue(conditions.ids),
      },
    });
  }

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
