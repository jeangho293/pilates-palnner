import { Body, Controller, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { AdminInstructorService } from '../application/admin-instructor.service';
import { AdminInstructorQueryDto, InstructorChangePublicDto } from './dto';

@Controller('admins/instructors')
export class AdminInstructorController {
  constructor(private readonly adminInstructorService: AdminInstructorService) {}

  @Get('search')
  async search(@Query() query: AdminInstructorQueryDto) {
    // 1. Destructure body, params, query
    const { keyword, isPublic, ...options } = query;

    // 2. Get context
    // 3. Get result
    const data = await this.adminInstructorService.search({ keyword, isPublic }, options);

    // 4. Send response
    return { data };
  }

  @Put(':id/public')
  async changePublicStatus(@Param('id', ParseIntPipe) id: number, @Body() body: InstructorChangePublicDto) {
    // 1. Destructure body, params, query
    const { isPublic } = body;

    // 2. Get context
    // 3. Get result
    await this.adminInstructorService.changePublicStatus({ id, isPublic });

    // 4. Send response
    return { data: {} };
  }
}
