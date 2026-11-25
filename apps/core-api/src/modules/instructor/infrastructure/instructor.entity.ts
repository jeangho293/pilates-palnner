import { DddRepository } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Instructor } from '../domain/instructor.entity';
import {
  applyLikeSearch,
  applyPagination,
  checkInValue,
  convertOptions,
  PaginationOptions,
  TypeormRelationOptions,
} from '@libs/utils';

@Injectable()
export class InstructorRepository extends DddRepository<Instructor> {
  entityClass = Instructor;

  async find(conditions: { ids?: number[] }, options?: TypeormRelationOptions<Instructor>) {
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

  async findAndCount(conditions: { isPublic?: boolean; keyword?: string }, options?: PaginationOptions) {
    const query = this.createQueryBuilder('instructor');

    if (conditions.isPublic !== undefined) {
      query.andWhere('instructor.isPublic = :isPublic', { isPublic: conditions.isPublic });
    }

    const likeSearch = applyLikeSearch(
      query,
      { name: 'instructor.name', specialties: 'instructor.specialties' },
      ['name', 'specialties'],
      conditions.keyword
    );

    return applyPagination(likeSearch, options).getManyAndCount();
  }
}
