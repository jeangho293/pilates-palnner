import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AdminStaffService } from '../application/admin-staff.service';
import { AdminStaffQueryDto } from './dto';

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
  async search(@Query() query: AdminStaffQueryDto) {
    // 1. Destructure body, params, query
    const { statuses, keyword, ...options } = query;

    // 2. Get context
    // 3. Get result
    const data = await this.adminStaffService.search({ statuses, keyword }, options);

    // 4. Send response
    return { data };
  }

  @Get(':id')
  async retrieve(@Param('id', ParseIntPipe) id: number) {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    const data = await this.adminStaffService.retrieve({ id });

    // 4. Send response
    return { data };
  }
}
