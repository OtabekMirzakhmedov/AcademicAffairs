import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicPeriodsService } from './academic-periods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('academic-periods')
@ApiBearerAuth('JWT-auth')
@Controller('academic-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicPeriodsController {
  constructor(
    private readonly academicPeriodsService: AcademicPeriodsService,
  ) {}

  @Get('active')
  @Roles('admin', 'departmenthead', 'teacher')
  @ApiOperation({ summary: 'Get active academic period', description: 'Retrieve the currently active academic period' })
  @ApiResponse({ status: 200, description: 'Returns active academic period' })
  @ApiResponse({ status: 404, description: 'No active period found' })
  async getActive() {
    const activePeriod = await this.academicPeriodsService.getActive();
    return {
      success: true,
      data: activePeriod,
    };
  }

  @Get()
  @Roles('admin', 'departmenthead', 'teacher')
  @ApiOperation({ summary: 'Get all academic periods', description: 'Retrieve list of all academic periods' })
  @ApiResponse({ status: 200, description: 'Returns list of academic periods' })
  async findAll() {
    const periods = await this.academicPeriodsService.findAll();
    return {
      success: true,
      data: periods,
    };
  }
}
