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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { AddCourseToProgramDto } from './dto/add-course-to-program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('programs')
@ApiBearerAuth('JWT-auth')
@Controller('programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'departmenthead')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create program',
    description: 'Create a new academic program',
  })
  @ApiResponse({ status: 201, description: 'Program created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Program code already exists' })
  async create(
    @Body() createProgramDto: CreateProgramDto,
    @CurrentUser() user: any,
  ) {
    const program = await this.programsService.create(
      createProgramDto,
      user.id,
    );
    return {
      success: true,
      data: program,
      message: 'Program created successfully',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all programs',
    description: 'Retrieve list of all academic programs',
  })
  @ApiResponse({ status: 200, description: 'Returns list of programs' })
  async findAll() {
    const programs = await this.programsService.findAll();
    return {
      success: true,
      data: programs,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get program by ID',
    description: 'Retrieve a specific program with its courses',
  })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns program data with courses',
  })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const program = await this.programsService.findOne(id);
    return {
      success: true,
      data: program,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update program',
    description: 'Update an academic program',
  })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({ status: 200, description: 'Program updated successfully' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramDto: UpdateProgramDto,
    @CurrentUser() user: any,
  ) {
    const program = await this.programsService.update(
      id,
      updateProgramDto,
      user.id,
    );
    return {
      success: true,
      data: program,
      message: 'Program updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete program',
    description: 'Delete an academic program',
  })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({ status: 200, description: 'Program deleted' })
  @ApiResponse({ status: 404, description: 'Program not found' })
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
  @ApiOperation({
    summary: 'Add course to program',
    description: 'Add a course to an academic program',
  })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiResponse({
    status: 201,
    description: 'Course added to program successfully',
  })
  @ApiResponse({ status: 400, description: 'Course already in program' })
  @ApiResponse({ status: 404, description: 'Program or course not found' })
  async addCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() addCourseDto: AddCourseToProgramDto,
  ) {
    const programCourse = await this.programsService.addCourse(
      id,
      addCourseDto,
    );
    return {
      success: true,
      data: programCourse,
      message: 'Course added to program successfully',
    };
  }

  @Delete(':id/courses/:courseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove course from program',
    description: 'Remove a course from an academic program',
  })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course removed from program' })
  @ApiResponse({
    status: 404,
    description: 'Program-course association not found',
  })
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
  @ApiOperation({
    summary: 'Update program course',
    description: 'Update course requirements in a program',
  })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Program course updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Program-course association not found',
  })
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
