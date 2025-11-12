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
import { CourseTeachersService } from './course-teachers.service';
import { CreateCourseTeacherDto } from './dto/create-course-teacher.dto';
import { UpdateCourseTeacherDto } from './dto/update-course-teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('course-teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseTeachersController {
  constructor(private readonly courseTeachersService: CourseTeachersService) {}

  @Post()
  @Roles('departmenthead')
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

  @Get()
  @Roles('admin', 'departmenthead', 'teacher')
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
