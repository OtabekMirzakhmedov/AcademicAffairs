import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    // Validate head if provided
    if (createDepartmentDto.headId) {
      const head = await this.prisma.user.findUnique({
        where: { id: createDepartmentDto.headId },
        include: { role: true },
      });

      if (!head) {
        throw new NotFoundException('Department head user not found');
      }

      if (head.role.name !== 'departmenthead') {
        throw new BadRequestException(
          'User must have departmenthead role to be a department head',
        );
      }
    }

    const department = await this.prisma.department.create({
      data: {
        name: createDepartmentDto.name,
        headId: createDepartmentDto.headId,
        phone: createDepartmentDto.phone,
        roomNumber: createDepartmentDto.roomNumber,
      },
      include: {
        head: {
          include: {
            userInfo: true,
          },
        },
        _count: {
          select: {
            teachers: true,
            courses: true,
          },
        },
      },
    });

    return department;
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        head: {
          include: {
            userInfo: true,
          },
        },
        _count: {
          select: {
            teachers: true,
            courses: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        head: {
          include: {
            userInfo: true,
          },
        },
        teachers: {
          include: {
            user: {
              include: {
                userInfo: true,
              },
            },
          },
        },
        courses: true,
        _count: {
          select: {
            teachers: true,
            courses: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id);

    // Validate head if provided
    if (updateDepartmentDto.headId) {
      const head = await this.prisma.user.findUnique({
        where: { id: updateDepartmentDto.headId },
        include: { role: true },
      });

      if (!head) {
        throw new NotFoundException('Department head user not found');
      }

      if (head.role.name !== 'departmenthead') {
        throw new BadRequestException(
          'User must have departmenthead role to be a department head',
        );
      }
    }

    const department = await this.prisma.department.update({
      where: { id },
      data: {
        name: updateDepartmentDto.name,
        headId: updateDepartmentDto.headId,
        phone: updateDepartmentDto.phone,
        roomNumber: updateDepartmentDto.roomNumber,
      },
      include: {
        head: {
          include: {
            userInfo: true,
          },
        },
        _count: {
          select: {
            teachers: true,
            courses: true,
          },
        },
      },
    });

    return department;
  }

  async remove(id: number) {
    const department = await this.findOne(id);

    // Check if department has teachers
    if (department._count.teachers > 0) {
      throw new BadRequestException(
        'Cannot delete department with active teachers',
      );
    }

    // Check if department has courses
    if (department._count.courses > 0) {
      throw new BadRequestException(
        'Cannot delete department with active courses',
      );
    }

    await this.prisma.department.delete({
      where: { id },
    });

    return { message: 'Department deleted successfully' };
  }
}
