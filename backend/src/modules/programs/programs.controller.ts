import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { AddCourseToProgramDto } from './dto/add-course-to-program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'departmenthead')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  async create(
    @Body() createProgramDto: CreateProgramDto,
    @CurrentUser() user: any,
  ) {
    const program = await this.programsService.create(createProgramDto, user.id);
    return {
      success: true,
      data: program,
      message: 'Program created successfully',
    };
  }

  @Get()
  async findAll() {
    const programs = await this.programsService.findAll();
    return {
      success: true,
      data: programs,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const program = await this.programsService.findOne(id);
    return {
      success: true,
      data: program,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramDto: UpdateProgramDto,
    @CurrentUser() user: any,
  ) {
    const program = await this.programsService.update(id, updateProgramDto, user.id);
    return {
      success: true,
      data: program,
      message: 'Program updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const result = await this.programsService.remove(id, user.id);
    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/courses')
  async addCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() addCourseDto: AddCourseToProgramDto,
  ) {
    const programCourse = await this.programsService.addCourse(id, addCourseDto);
    return {
      success: true,
      data: programCourse,
      message: 'Course added to program successfully',
    };
  }

  @Delete(':id/courses/:courseId')
  @HttpCode(HttpStatus.OK)
  async removeCourse(
    @Param('id', ParseIntPipe) id: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const result = await this.programsService.removeCourse(id, courseId);
    return {
      success: true,
      data: result,
    };
  }

  @Patch(':id/courses/:courseId')
  async updateProgramCourse(
    @Param('id', ParseIntPipe) id: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() updateData: { isRequired?: boolean; recommendedSemester?: number },
  ) {
    const programCourse = await this.programsService.updateProgramCourse(
      id,
      courseId,
      updateData,
    );
    return {
      success: true,
      data: programCourse,
      message: 'Program course updated successfully',
    };
  }
}
