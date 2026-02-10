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
  async getRoles() {
    const roles = await this.prisma.role.findMany();
    return {
      success: true,
      data: roles,
    };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
    };
  }

  @Post('teachers')
  @Roles('departmenthead')
  async createTeacher(
    @Body() createTeacherDto: CreateTeacherDto,
    @CurrentUser() user: any,
  ) {
    const teacher = await this.usersService.createTeacher(createTeacherDto, user.id);
    return {
      success: true,
      data: teacher,
      message: 'Teacher created successfully with default password "password123"',
    };
  }

  @Patch('teachers/:id')
  @Roles('departmenthead')
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
  async updateAccount(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateUserAccountDto,
    @CurrentUser() user: any,
  ) {
    // Teachers can only update their own account
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
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users,
    };
  }

  @Get(':id')
  @Roles('admin', 'departmenthead')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return {
      success: true,
      data: user,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
  }

  @Patch(':id/toggle-status')
  @HttpCode(HttpStatus.OK)
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.toggleStatus(id);
    return {
      success: true,
      data: user,
      message: 'User status updated successfully',
    };
  }

  @Delete(':id')
  @Roles('admin', 'departmenthead')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const result = await this.usersService.remove(id, user.id);
    return {
      success: true,
      data: result,
    };
  }
}
