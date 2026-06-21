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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateTeacherInfoDto } from './dto/update-teacher-info.dto';
import { UpdateUserAccountDto } from './dto/update-user-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('roles')
  @Roles('admin', 'departmenthead')
  @ApiOperation({ summary: 'Get all roles', description: 'Retrieve list of all available roles' })
  @ApiResponse({ status: 200, description: 'Returns list of roles' })
  async getRoles() {
    const roles = await this.prisma.role.findMany();
    return {
      success: true,
      data: roles,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create user', description: 'Create a new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'User with this login already exists' })
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const result = await this.usersService.create(createUserDto, actor);
    return {
      success: true,
      data: result,
      message: 'User created successfully',
    };
  }

  @Post('teachers')
  @Roles('departmenthead')
  @ApiOperation({ summary: 'Create teacher', description: 'Create a new teacher in department head\'s department' })
  @ApiResponse({ status: 201, description: 'Teacher created with default password "password123"' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Not a department head' })
  async createTeacher(
    @Body() createTeacherDto: CreateTeacherDto,
    @CurrentUser() user: any,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const teacher = await this.usersService.createTeacher(createTeacherDto, actor);
    return {
      success: true,
      data: teacher,
      message: 'Teacher created successfully with default password "password123"',
    };
  }

  @Patch('teachers/:id')
  @Roles('departmenthead')
  @ApiOperation({ summary: 'Update teacher info', description: 'Update teacher employment and mandatory hours (department head only)' })
  @ApiParam({ name: 'id', description: 'Teacher user ID' })
  @ApiResponse({ status: 200, description: 'Teacher info updated successfully' })
  @ApiResponse({ status: 403, description: 'Teacher not in your department' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async updateTeacherInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherInfoDto: UpdateTeacherInfoDto,
    @CurrentUser() user: any,
  ) {
    const teacher = await this.usersService.updateTeacherInfo(
      id,
      updateTeacherInfoDto,
      user.id,
    );
    return {
      success: true,
      data: teacher,
      message: 'Teacher info updated successfully',
    };
  }

  @Patch(':id/account')
  @Roles('admin', 'departmenthead', 'teacher')
  @ApiOperation({ summary: 'Update user account', description: 'Update user personal and professional information' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 403, description: 'Cannot update other user\'s account' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateUserAccountDto,
    @CurrentUser() user: any,
  ) {
    if (user.role === 'teacher' && user.id !== id) {
      throw new Error('You can only update your own account');
    }

    const updatedUser = await this.usersService.updateUserAccount(id, updateAccountDto);
    return {
      success: true,
      data: updatedUser,
      message: 'Account updated successfully',
    };
  }

  @Get()
  @Roles('admin', 'departmenthead')
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve list of all users' })
  @ApiResponse({ status: 200, description: 'Returns list of users' })
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users,
    };
  }

  @Get(':id')
  @Roles('admin', 'departmenthead')
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve a specific user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns user data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return {
      success: true,
      data: user,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user', description: 'Update user data (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const result = await this.usersService.update(id, updateUserDto, actor);
    return {
      success: true,
      data: result,
      message: 'User updated successfully',
    };
  }

  @Patch(':id/toggle-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle user status', description: 'Activate or deactivate a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User status toggled' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const result = await this.usersService.toggleStatus(id, actor);
    return {
      success: true,
      data: result,
      message: 'User status updated successfully',
    };
  }

  @Delete(':id')
  @Roles('admin', 'departmenthead')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user', description: 'Permanently delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Cannot delete yourself or higher role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const actor = { id: user.id, login: user.login, role: user.role.name };
    const result = await this.usersService.remove(id, actor);
    return {
      success: true,
      data: result,
    };
  }
}
