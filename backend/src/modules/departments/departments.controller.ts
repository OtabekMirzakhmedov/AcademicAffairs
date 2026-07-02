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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('departments')
@ApiBearerAuth('JWT-auth')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create department',
    description: 'Create a new department (admin only)',
  })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentUser() user: any,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const department = await this.departmentsService.create(
      createDepartmentDto,
      actor,
    );
    return {
      success: true,
      data: department,
      message: 'Department created successfully',
    };
  }

  @Get()
  @Roles('admin', 'departmenthead')
  @ApiOperation({
    summary: 'Get all departments',
    description: 'Retrieve list of all departments',
  })
  @ApiResponse({ status: 200, description: 'Returns list of departments' })
  async findAll() {
    const departments = await this.departmentsService.findAll();
    return {
      success: true,
      data: departments,
    };
  }

  @Get(':id')
  @Roles('admin', 'departmenthead')
  @ApiOperation({
    summary: 'Get department by ID',
    description: 'Retrieve a specific department by ID',
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Returns department data' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const department = await this.departmentsService.findOne(id);
    return {
      success: true,
      data: department,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update department',
    description: 'Update department data (admin only)',
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentUser() user: any,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const department = await this.departmentsService.update(
      id,
      updateDepartmentDto,
      actor,
    );
    return {
      success: true,
      data: department,
      message: 'Department updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete department',
    description: 'Permanently delete a department (admin only)',
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department deleted' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const result = await this.departmentsService.remove(id, actor);
    return {
      success: true,
      data: result,
    };
  }
}
