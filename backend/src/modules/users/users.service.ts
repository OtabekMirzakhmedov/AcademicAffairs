import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { login: createUserDto.login },
    });

    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user with user info
    const user = await this.prisma.user.create({
      data: {
        login: createUserDto.login,
        password: hashedPassword,
        roleId: createUserDto.roleId,
        mustChangePassword: true,
        userInfo: {
          create: {
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            email1: createUserDto.email1,
            email2: createUserDto.email2,
            phone1: createUserDto.phone1,
            phone2: createUserDto.phone2,
          },
        },
      },
      include: {
        role: true,
        userInfo: true,
      },
    });

    // If teacher role and department provided, create teacher info
    if (
      user.role.name === 'teacher' &&
      createUserDto.departmentId
    ) {
      await this.prisma.teacherInfo.create({
        data: {
          userId: user.id,
          departmentId: createUserDto.departmentId,
        },
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createTeacher(createTeacherDto: CreateTeacherDto, departmentHeadId: number) {
    // Verify department head and get their department
    const department = await this.prisma.department.findFirst({
      where: { headId: departmentHeadId },
    });

    if (!department) {
      throw new ForbiddenException('You are not a department head');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { login: createTeacherDto.login },
    });

    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    // Get teacher role
    const teacherRole = await this.prisma.role.findUnique({
      where: { name: 'teacher' },
    });

    if (!teacherRole) {
      throw new BadRequestException('Teacher role not found');
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create user with user info and teacher info
    const user = await this.prisma.user.create({
      data: {
        login: createTeacherDto.login,
        password: hashedPassword,
        roleId: teacherRole.id,
        mustChangePassword: true,
        userInfo: {
          create: {
            firstName: createTeacherDto.firstName,
            lastName: createTeacherDto.lastName,
            email1: createTeacherDto.email1,
            email2: createTeacherDto.email2,
            phone1: createTeacherDto.phone1,
            phone2: createTeacherDto.phone2,
          },
        },
        teacherInfo: {
          create: {
            departmentId: department.id,
          },
        },
      },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remove passwords from response
    return users.map(({ password: _, ...user }) => user);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.findOne(id);

    // If login is being updated, check for conflicts
    if (updateUserDto.login && updateUserDto.login !== existingUser.login) {
      const loginExists = await this.prisma.user.findUnique({
        where: { login: updateUserDto.login },
      });

      if (loginExists) {
        throw new ConflictException('User with this login already exists');
      }
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        login: updateUserDto.login,
        roleId: updateUserDto.roleId,
        userInfo: {
          update: {
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
            email1: updateUserDto.email1,
            email2: updateUserDto.email2,
            phone1: updateUserDto.phone1,
            phone2: updateUserDto.phone2,
          },
        },
      },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    // Update teacher info if needed
    if (updateUserDto.departmentId && user.role.name === 'teacher') {
      const teacherInfo = await this.prisma.teacherInfo.findUnique({
        where: { userId: id },
      });

      if (teacherInfo) {
        await this.prisma.teacherInfo.update({
          where: { userId: id },
          data: {
            departmentId: updateUserDto.departmentId,
          },
        });
      } else {
        await this.prisma.teacherInfo.create({
          data: {
            userId: id,
            departmentId: updateUserDto.departmentId,
          },
        });
      }
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async toggleStatus(id: number) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      include: {
        role: true,
        userInfo: true,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: number) {
    await this.findOne(id);

    // Soft delete by deactivating
    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return { message: 'User deactivated successfully' };
  }
}
