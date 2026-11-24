import { DddException } from '@libs/ddd';
import { HttpStatus } from '@nestjs/common';

export class StaffNotFoundException extends DddException {
  constructor(id: number) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: 'STAFF_NOT_FOUND',
      clientMessage: '존재하지 않는 스태프입니다.',
      serverMessage: `존재하지 않는 스태프입니다. id: ${id}`,
    });
  }
}
