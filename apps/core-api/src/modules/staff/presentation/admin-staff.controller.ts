import { Body, Controller, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { AdminStaffService } from '../application/admin-staff.service';
import { AdminStaffQueryDto, StaffChangeNameDto } from './dto';

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

  @Put(':id/name')
  async changeName(@Param('id', ParseIntPipe) id: number, @Body() body: StaffChangeNameDto) {
    // 1. Destructure body, params, query
    // 2. Get context
    // 3. Get result
    await this.adminStaffService.changeName({ id, name: body.name });

    // 4. Send response
    return { data: {} };
  }
}
