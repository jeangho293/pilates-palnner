import { Module } from '@nestjs/common';
import { StaffModule } from './staff/staff.module';
import { InstructorModule } from './instructor/instructor.module';

@Module({
  imports: [StaffModule, InstructorModule],
  exports: [StaffModule, InstructorModule],
})
export class GlobalDomainModule {}
