import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditActor } from '../audit/interfaces/audit-actor.interface';
import { CreateScientificTaskDto } from './dto/create-scientific-task.dto';
import { UpdateScientificTaskDto } from './dto/update-scientific-task.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ScientificTasksService {
  private readonly logger = new Logger(ScientificTasksService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async createTask(userId: number, dto: CreateScientificTaskDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        teacherInfo: true,
        headedDepartments: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleName = user.role.name.toLowerCase();

    if (roleName !== 'admin' && roleName !== 'departmenthead') {
      throw new ForbiddenException('Only admins and department heads can create scientific tasks');
    }

    let departmentId: number | null = null;
    let targetTeachers: number[] = [];

    if (roleName === 'admin') {
      const teachers = await this.prisma.teacherInfo.findMany({
        select: { userId: true },
      });
      targetTeachers = teachers.map((t) => t.userId);
    } else if (roleName === 'departmenthead') {
      const deptHead = user.headedDepartments[0];
      if (!deptHead) {
        throw new ForbiddenException('Department head assignment not found');
      }

      departmentId = deptHead.id;
      const teachers = await this.prisma.teacherInfo.findMany({
        where: { departmentId },
        select: { userId: true },
      });
      targetTeachers = teachers.map((t) => t.userId);
    }

    const task = await this.prisma.scientificTask.create({
      data: {
        taskName: dto.taskName,
        taskDescription: dto.taskDescription,
        deadline: new Date(dto.deadline),
        createdBy: userId,
        departmentId,
      },
      include: {
        creator: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        department: true,
      },
    });

    if (targetTeachers.length > 0) {
      await this.prisma.teacherScientificReport.createMany({
        data: targetTeachers.map((teacherId) => ({
          scientificTaskId: task.id,
          teacherId,
          status: 'in_progress',
        })),
      });
    }

    return task;
  }

  async findAllTasks(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        teacherInfo: true,
        headedDepartments: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleName = user.role.name.toLowerCase();

    let where: any = { isActive: true };

    if (roleName === 'teacher') {
      const reports = await this.prisma.teacherScientificReport.findMany({
        where: { teacherId: userId },
        select: { scientificTaskId: true },
      });
      const taskIds = reports.map((r) => r.scientificTaskId);
      where = { id: { in: taskIds }, isActive: true };
    } else if (roleName === 'departmenthead') {
      const deptHead = user.headedDepartments[0];
      if (deptHead) {
        where = {
          OR: [
            { departmentId: deptHead.id },
            { departmentId: null },
          ],
          isActive: true,
        };
      }
    }

    return this.prisma.scientificTask.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        department: true,
        _count: {
          select: { reports: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneTask(taskId: number, userId: number) {
    const task = await this.prisma.scientificTask.findUnique({
      where: { id: taskId },
      include: {
        creator: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        department: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.checkTaskAccess(userId, taskId);

    return task;
  }

  async updateTask(taskId: number, userId: number, dto: UpdateScientificTaskDto) {
    const task = await this.prisma.scientificTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdBy !== userId) {
      throw new ForbiddenException('Only the task creator can update it');
    }

    return this.prisma.scientificTask.update({
      where: { id: taskId },
      data: dto,
      include: {
        creator: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        department: true,
      },
    });
  }

  async deleteTask(taskId: number, userId: number) {
    const task = await this.prisma.scientificTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdBy !== userId) {
      throw new ForbiddenException('Only the task creator can delete it');
    }

    await this.prisma.scientificTask.delete({
      where: { id: taskId },
    });
  }

  async getMyReports(userId: number) {
    return this.prisma.teacherScientificReport.findMany({
      where: { teacherId: userId },
      include: {
        scientificTask: {
          include: {
            creator: {
              select: {
                id: true,
                login: true,
                userInfo: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        validator: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getReport(reportId: number, userId: number) {
    const report = await this.prisma.teacherScientificReport.findUnique({
      where: { id: reportId },
      include: {
        scientificTask: true,
        teacher: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        validator: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, headedDepartments: true },
    });

    const roleName = user?.role.name.toLowerCase();

    if (roleName === 'teacher' && report.teacherId !== userId) {
      throw new ForbiddenException('You can only view your own reports');
    }

    return report;
  }

  async updateReport(reportId: number, userId: number, dto: UpdateReportDto) {
    const report = await this.prisma.teacherScientificReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.teacherId !== userId) {
      throw new ForbiddenException('You can only update your own reports');
    }

    return this.prisma.teacherScientificReport.update({
      where: { id: reportId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
      include: {
        scientificTask: true,
      },
    });
  }

  async submitReport(reportId: number, actor: AuditActor) {
    const report = await this.prisma.teacherScientificReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.teacherId !== actor.id) {
      throw new ForbiddenException('You can only submit your own reports');
    }

    const before = { id: report.id, status: report.status };

    const result = await this.prisma.teacherScientificReport.update({
      where: { id: reportId },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
      include: {
        scientificTask: true,
      },
    });

    await this.audit.log(actor, 'submit', 'TeacherScientificReport', reportId, {
      before,
      after: { id: reportId, status: 'submitted' },
    });
    this.logger.log({ event: 'scientific_report.submitted', reportId, teacherId: actor.id });

    return result;
  }

  async getSubmittedReports(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        teacherInfo: true,
        headedDepartments: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleName = user.role.name.toLowerCase();

    if (roleName === 'teacher') {
      throw new ForbiddenException('Teachers cannot access this endpoint');
    }

    let where: any = {};

    if (roleName === 'departmenthead') {
      const deptHead = user.headedDepartments[0];
      if (deptHead) {
        const teacherIds = await this.prisma.teacherInfo.findMany({
          where: { departmentId: deptHead.id },
          select: { userId: true },
        });
        where.teacherId = { in: teacherIds.map((t) => t.userId) };
      } else {
        where.teacherId = { in: [] };
      }
    }

    return this.prisma.teacherScientificReport.findMany({
      where,
      include: {
        scientificTask: true,
        teacher: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            teacherInfo: {
              select: {
                department: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        validator: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async validateReport(reportId: number, actor: AuditActor) {
    const report = await this.prisma.teacherScientificReport.findUnique({
      where: { id: reportId },
      include: {
        teacher: {
          include: {
            teacherInfo: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== 'submitted') {
      throw new BadRequestException('Only submitted reports can be validated');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: actor.id },
      include: { role: true, headedDepartments: true },
    });

    const roleName = user?.role.name.toLowerCase();

    if (roleName === 'departmenthead') {
      const deptHead = user?.headedDepartments[0];
      if (deptHead?.id !== report.teacher.teacherInfo?.departmentId) {
        throw new ForbiddenException('You can only validate reports from your department');
      }
    } else if (roleName !== 'admin') {
      throw new ForbiddenException('Only admins and department heads can validate reports');
    }

    const before = { id: report.id, status: report.status };

    const result = await this.prisma.teacherScientificReport.update({
      where: { id: reportId },
      data: {
        status: 'validated',
        validatedAt: new Date(),
        validatedBy: actor.id,
      },
      include: {
        scientificTask: true,
        teacher: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    await this.audit.log(actor, 'validate', 'TeacherScientificReport', reportId, {
      before,
      after: { id: reportId, status: 'validated', validatedBy: actor.id },
    });
    this.logger.log({ event: 'scientific_report.validated', reportId, validatorId: actor.id, teacherId: report.teacherId });

    return result;
  }

  async rejectReport(reportId: number, actor: AuditActor) {
    const report = await this.prisma.teacherScientificReport.findUnique({
      where: { id: reportId },
      include: {
        teacher: {
          include: {
            teacherInfo: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== 'submitted') {
      throw new BadRequestException('Only submitted reports can be rejected');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: actor.id },
      include: { role: true, headedDepartments: true },
    });

    const roleName = user?.role.name.toLowerCase();

    if (roleName === 'departmenthead') {
      const deptHead = user?.headedDepartments[0];
      if (deptHead?.id !== report.teacher.teacherInfo?.departmentId) {
        throw new ForbiddenException('You can only reject reports from your department');
      }
    } else if (roleName !== 'admin') {
      throw new ForbiddenException('Only admins and department heads can reject reports');
    }

    const before = { id: report.id, status: report.status };

    const result = await this.prisma.teacherScientificReport.update({
      where: { id: reportId },
      data: {
        status: 'rejected',
        validatedAt: new Date(),
        validatedBy: actor.id,
      },
      include: {
        scientificTask: true,
        teacher: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    await this.audit.log(actor, 'reject', 'TeacherScientificReport', reportId, {
      before,
      after: { id: reportId, status: 'rejected', validatedBy: actor.id },
    });
    this.logger.log({ event: 'scientific_report.rejected', reportId, validatorId: actor.id, teacherId: report.teacherId });

    return result;
  }

  async getTaskProgress(taskId: number, userId: number) {
    await this.checkTaskAccess(userId, taskId);

    const task = await this.prisma.scientificTask.findUnique({
      where: { id: taskId },
      include: {
        creator: {
          select: {
            id: true,
            login: true,
            userInfo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        reports: {
          include: {
            teacher: {
              select: {
                id: true,
                login: true,
                userInfo: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
                teacherInfo: {
                  select: {
                    department: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            validator: {
              select: {
                id: true,
                login: true,
                userInfo: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            teacher: {
              userInfo: {
                lastName: 'asc',
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private async checkTaskAccess(userId: number, taskId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        teacherInfo: true,
        headedDepartments: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleName = user.role.name.toLowerCase();

    if (roleName === 'admin') {
      return;
    }

    const task = await this.prisma.scientificTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (roleName === 'departmenthead') {
      const deptHead = user.headedDepartments[0];
      if (task.departmentId !== null && task.departmentId !== deptHead?.id) {
        throw new ForbiddenException('You do not have access to this task');
      }
    } else if (roleName === 'teacher') {
      const report = await this.prisma.teacherScientificReport.findFirst({
        where: {
          scientificTaskId: taskId,
          teacherId: userId,
        },
      });

      if (!report) {
        throw new ForbiddenException('You do not have access to this task');
      }
    }
  }
}
