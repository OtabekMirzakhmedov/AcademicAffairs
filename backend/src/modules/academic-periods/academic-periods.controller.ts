import { Controller, Get, UseGuards } from '@nestjs/common';
import { AcademicPeriodsService } from './academic-periods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('academic-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicPeriodsController {
  constructor(
    private readonly academicPeriodsService: AcademicPeriodsService,
  ) {}

  @Get('active')
  @Roles('admin', 'departmenthead', 'teacher')
  async getActive() {
    const activePeriod = await this.academicPeriodsService.getActive();
    return {
      success: true,
      data: activePeriod,
    };
  }

  @Get()
  @Roles('admin', 'departmenthead', 'teacher')
  async findAll() {
    const periods = await this.academicPeriodsService.findAll();
    return {
      success: true,
      data: periods,
    };
  }
}
