import { DddException } from '@libs/ddd';
import { HttpStatus } from '@nestjs/common';

export class InstructorNotFoundException extends DddException {
  constructor({ id }: { id: number }) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      errorCode: 'INSTRUCTOR_NOT_FOUND',
      clientMessage: '존재하지 않는 강사입니다.',
      serverMessage: `존재하지 않는 강사입니다. id: ${id}`,
    });
  }
}

export class InstructorStaffExitedException extends DddException {
  constructor({ staffId }: { staffId: number }) {
    super({
      statusCode: HttpStatus.CONFLICT,
      errorCode: 'INSTRUCTOR_STAFF_EXITED',
      clientMessage: '퇴사한 직원의 프로필은 공개할 수 없습니다. 직원을 먼저 복귀 처리하세요.',
      serverMessage: `퇴사한 직원의 프로필은 공개할 수 없습니다. staffId: ${staffId}`,
    });
  }
}
