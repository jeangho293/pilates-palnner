import { Controller, Get, Query } from '@nestjs/common';
import { AdminStaffService } from '../application/admin-staff.service';

@Controller('admins/staffs')
export class AdminStaffController {
  constructor(private readonly adminStaffService: AdminStaffService) {}

  @Get()
  async list() {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    const data = await this.adminStaffService.list();

    // 4. Send response
    return { data };
  }

  @Get('search')
  async search(@Query() query: any) {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    // 4. Send response
    return { data: {} };
  }
}
