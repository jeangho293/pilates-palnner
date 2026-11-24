import { Module } from '@nestjs/common';
import { InstructorRepository } from './infrastructure/instructor.entity';
import { AdminInstructorService } from './application/admin-instructor.service';
import { AdminInstructorController } from './presentation/admin-instructor.controller';
import { StaffModule } from '@modules/staff/staff.module';

@Module({
  imports: [StaffModule],
  controllers: [AdminInstructorController],
  providers: [InstructorRepository, AdminInstructorService],
  exports: [InstructorRepository],
})
export class InstructorModule {}
