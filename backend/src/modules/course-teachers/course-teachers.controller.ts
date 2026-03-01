import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CourseTeachersService } from './course-teachers.service';
import { CreateCourseTeacherDto } from './dto/create-course-teacher.dto';
import { UpdateCourseTeacherDto } from './dto/update-course-teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('course-teachers')
@ApiBearerAuth('JWT-auth')
@Controller('course-teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseTeachersController {
  constructor(private readonly courseTeachersService: CourseTeachersService) {}

  @Post()
  @Roles('departmenthead')
  @ApiOperation({ summary: 'Assign teacher to course', description: 'Create a teacher-course assignment for an academic period' })
  @ApiResponse({ status: 201, description: 'Teacher assigned to course successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or assignment already exists' })
  @ApiResponse({ status: 403, description: 'Not a department head' })
  async create(
    @Body() createDto: CreateCourseTeacherDto,
    @CurrentUser() user: any,
  ) {
    const assignment = await this.courseTeachersService.create(
      createDto,
      user.id,
    );
    return {
      success: true,
      data: assignment,
      message: 'Teacher assigned to course successfully',
    };
  }

  @Get('my-assignments')
  @Roles('teacher')
  @ApiOperation({ summary: 'Get my course assignments', description: 'Get all course assignments for the current teacher' })
  @ApiResponse({ status: 200, description: 'Returns list of course assignments' })
  async getMyAssignments(@CurrentUser() user: any) {
    const assignments = await this.courseTeachersService.getTeacherAssignments(user.id);
    return {
      success: true,
      data: assignments,
    };
  }

  @Get()
  @Roles('admin', 'departmenthead', 'teacher')
  @ApiOperation({ summary: 'Get all course-teacher assignments', description: 'Get assignments based on user role' })
  @ApiQuery({ name: 'courseId', required: false, description: 'Filter by course ID' })
  @ApiResponse({ status: 200, description: 'Returns list of assignments' })
  async findAll(
    @CurrentUser() user: any,
    @Query('courseId', new ParseIntPipe({ optional: true })) courseId?: number,
  ) {
    const assignments = await this.courseTeachersService.findAll(
      user.id,
      user.role.name,
      courseId,
    );
    return {
      success: true,
      data: assignments,
    };
  }

  @Get(':id')
  @Roles('admin', 'departmenthead', 'teacher')
  @ApiOperation({ summary: 'Get assignment by ID', description: 'Retrieve a specific course-teacher assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Returns assignment data' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const assignment = await this.courseTeachersService.findOne(
      id,
      user.id,
      user.role.name,
    );
    return {
      success: true,
      data: assignment,
    };
  }

  @Patch(':id')
  @Roles('admin', 'departmenthead')
  @ApiOperation({ summary: 'Update assignment', description: 'Update course-teacher assignment (groups)' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Assignment updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCourseTeacherDto,
    @CurrentUser() user: any,
  ) {
    const assignment = await this.courseTeachersService.update(
      id,
      updateDto,
      user.id,
      user.role.name,
    );
    return {
      success: true,
      data: assignment,
      message: 'Assignment updated successfully',
    };
  }

  @Delete(':id')
  @Roles('admin', 'departmenthead')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove assignment', description: 'Remove a course-teacher assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Assignment removed successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const result = await this.courseTeachersService.remove(
      id,
      user.id,
      user.role.name,
    );
    return {
      success: true,
      data: result,
      message: 'Assignment removed successfully',
    };
  }
}
