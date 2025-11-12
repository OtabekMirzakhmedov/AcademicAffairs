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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('departmenthead')
  async create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: any) {
    const course = await this.coursesService.create(createCourseDto, user.id);
    return {
      success: true,
      data: course,
      message: 'Course created successfully',
    };
  }

  @Get()
  @Roles('admin', 'departmenthead', 'teacher')
  async findAll(@CurrentUser() user: any) {
    const courses = await this.coursesService.findAll(
      user.id,
      user.role.name,
    );
    return {
      success: true,
      data: courses,
    };
  }

  @Get(':id')
  @Roles('admin', 'departmenthead', 'teacher')
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const course = await this.coursesService.findOne(id, user.id, user.role.name);
    return {
      success: true,
      data: course,
    };
  }

  @Patch(':id')
  @Roles('admin', 'departmenthead')
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
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const result = await this.coursesService.remove(id, user.id, user.role.name);
    return {
      success: true,
      data: result,
      message: 'Course deleted successfully',
    };
  }
}
