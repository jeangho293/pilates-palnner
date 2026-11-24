import { Module } from '@nestjs/common';
import { AdminStaffController } from './presentation/admin-staff.controller';
import { AdminStaffService } from './application/admin-staff.service';
import { StaffRepository } from './infrastructure/staff.repository';

@Module({
  imports: [],
  controllers: [AdminStaffController],
  providers: [AdminStaffService, StaffRepository],
  exports: [StaffRepository],
})
export class StaffModule {}
