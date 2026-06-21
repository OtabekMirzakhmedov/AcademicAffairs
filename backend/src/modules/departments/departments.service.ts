import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditActor } from '../audit/interfaces/audit-actor.interface';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto, actor: AuditActor) {
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

    await this.audit.log(actor, 'create', 'Department', department.id, {
      after: { id: department.id, name: department.name, headId: department.headId },
    });
    this.logger.log({ event: 'department.created', departmentId: department.id, actorId: actor.id });

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

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto, actor: AuditActor) {
    const existing = await this.findOne(id);

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

    const headChanged =
      updateDepartmentDto.headId !== undefined &&
      updateDepartmentDto.headId !== existing.headId;

    const action = headChanged ? 'assign' : 'update';
    await this.audit.log(actor, action, 'Department', id, {
      before: { id, name: existing.name, headId: existing.headId },
      after: { id, name: department.name, headId: department.headId },
    });

    return department;
  }

  async remove(id: number, actor: AuditActor) {
    const department = await this.findOne(id);

    if (department._count.teachers > 0) {
      throw new BadRequestException(
        'Cannot delete department with active teachers',
      );
    }

    if (department._count.courses > 0) {
      throw new BadRequestException(
        'Cannot delete department with active courses',
      );
    }

    await this.prisma.department.delete({
      where: { id },
    });

    await this.audit.log(actor, 'delete', 'Department', id, {
      before: { id, name: department.name },
    });
    this.logger.log({ event: 'department.deleted', departmentId: id, actorId: actor.id });

    return { message: 'Department deleted successfully' };
  }
}
