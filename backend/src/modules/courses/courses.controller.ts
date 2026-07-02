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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('courses')
@ApiBearerAuth('JWT-auth')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('departmenthead')
  @ApiOperation({
    summary: 'Create course',
    description: "Create a new course in department head's department",
  })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Not a department head' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: any,
  ) {
    const course = await this.coursesService.create(createCourseDto, user.id);
    return {
      success: true,
      data: course,
      message: 'Course created successfully',
    };
  }

  @Get()
  @Roles('admin', 'departmenthead', 'teacher')
  @ApiOperation({
    summary: 'Get all courses',
    description:
      'Get courses based on user role (all for admin, department for head, assigned for teacher)',
  })
  @ApiResponse({ status: 200, description: 'Returns list of courses' })
  async findAll(@CurrentUser() user: any) {
    const courses = await this.coursesService.findAll(user.id, user.role.name);
    return {
      success: true,
      data: courses,
    };
  }

  @Get(':id')
  @Roles('admin', 'departmenthead', 'teacher')
  @ApiOperation({
    summary: 'Get course by ID',
    description: 'Retrieve a specific course by ID',
  })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Returns course data' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const course = await this.coursesService.findOne(
      id,
      user.id,
      user.role.name,
    );
    return {
      success: true,
      data: course,
    };
  }

  @Patch(':id')
  @Roles('admin', 'departmenthead')
  @ApiOperation({ summary: 'Update course', description: 'Update course data' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    const course = await this.coursesService.update(
      id,
      updateCourseDto,
      user.id,
      user.role.name,
    );
    return {
      success: true,
      data: course,
      message: 'Course updated successfully',
    };
  }

  @Delete(':id')
  @Roles('admin', 'departmenthead')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete course',
    description: 'Permanently delete a course',
  })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({
    status: 409,
    description: 'Course has teaching activity records and cannot be deleted',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const result = await this.coursesService.remove(
      id,
      user.id,
      user.role.name,
    );
    return {
      success: true,
      data: result,
      message: 'Course deleted successfully',
    };
  }
}
