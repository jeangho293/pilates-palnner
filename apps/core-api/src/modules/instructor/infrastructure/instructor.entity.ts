import { DddRepository } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Instructor } from '../domain/instructor.entity';
import { applyLikeSearch, applyPagination, PaginationOptions } from '@libs/utils';

@Injectable()
export class InstructorRepository extends DddRepository<Instructor> {
  entityClass = Instructor;

  async find() {}

  async count() {}

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
