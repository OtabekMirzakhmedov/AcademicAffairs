import { Controller, Get, UseGuards } from '@nestjs/common';
import { CourseTeachersService } from './course-teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('course-teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseTeachersController {
  constructor(
    private readonly courseTeachersService: CourseTeachersService,
  ) {}

  @Get('my-assignments')
  @Roles('teacher')
  async getMyAssignments(@CurrentUser() user: any) {
    const assignments =
      await this.courseTeachersService.getTeacherAssignments(user.id);
    return {
      success: true,
      data: assignments,
    };
  }
}
