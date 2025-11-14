import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateScientificTaskDto } from './dto/create-scientific-task.dto';
import { UpdateScientificTaskDto } from './dto/update-scientific-task.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ScientificTasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a scientific task
   * Admin creates for all teachers, Dept Head creates for their department only
   */
  async createTask(userId: number, dto: CreateScientificTaskDto) {
    // Get user with role and department info
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

    // Only admin and dept heads can create tasks
    if (roleName !== 'admin' && roleName !== 'departmenthead') {
      throw new ForbiddenException('Only admins and department heads can create scientific tasks');
    }

    let departmentId: number | null = null;
    let targetTeachers: number[] = [];

    if (roleName === 'admin') {
      // Admin creates task for ALL teachers
      const teachers = await this.prisma.teacherInfo.findMany({
        select: { userId: true },
      });
      targetTeachers = teachers.map((t) => t.userId);
    } else if (roleName === 'departmenthead') {
      // Dept head creates task for their department only
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

    // Create the task
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

    // Auto-create report records for all target teachers
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

  /**
   * Get all tasks visible to the user
   */
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
      // Teachers see tasks assigned to them (their reports exist)
      const reports = await this.prisma.teacherScientificReport.findMany({
        where: { teacherId: userId },
        select: { scientificTaskId: true },
      });
      const taskIds = reports.map((r) => r.scientificTaskId);
      where = { id: { in: taskIds }, isActive: true };
    } else if (roleName === 'departmenthead') {
      // Dept heads see tasks for their department
      const deptHead = user.headedDepartments[0];
      if (deptHead) {
        where = {
          OR: [
            { departmentId: deptHead.id },
            { departmentId: null }, // Admin-created tasks visible to all
          ],
          isActive: true,
        };
      }
    }
    // Admin sees all tasks (no additional filters)

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

  /**
   * Get a single task by ID
   */
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

    // Check if user has access to this task
    await this.checkTaskAccess(userId, taskId);

    return task;
  }

  /**
   * Update a scientific task
   */
  async updateTask(taskId: number, userId: number, dto: UpdateScientificTaskDto) {
    const task = await this.prisma.scientificTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Only creator can update
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

  /**
   * Get teacher's own reports
   */
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

  /**
   * Get a single report
   */
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

    // Check access
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

  /**
   * Update a report (teacher can update even after submission)
   */
  async updateReport(reportId: number, userId: number, dto: UpdateReportDto) {
    const report = await this.prisma.teacherScientificReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Only the teacher who owns the report can update it
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

  /**
   * Submit a report
   */
  async submitReport(reportId: number, userId: number) {
    const report = await this.prisma.teacherScientificReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.teacherId !== userId) {
      throw new ForbiddenException('You can only submit your own reports');
    }

    return this.prisma.teacherScientificReport.update({
      where: { id: reportId },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
      include: {
        scientificTask: true,
      },
    });
  }

  /**
   * Get all submitted reports (for dept heads and admins)
   * Department heads can see all reports (including in_progress) from their department
   * Admins can see all reports
   */
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
      // Dept head sees ALL reports from teachers in their department
      const deptHead = user.headedDepartments[0];
      if (deptHead) {
        const teacherIds = await this.prisma.teacherInfo.findMany({
          where: { departmentId: deptHead.id },
          select: { userId: true },
        });
        where.teacherId = { in: teacherIds.map((t) => t.userId) };
      } else {
        // If no department assigned, return empty
        where.teacherId = { in: [] };
      }
    }
    // Admin sees all reports

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

  /**
   * Validate a report
   */
  async validateReport(reportId: number, userId: number) {
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

    // Check if user is admin or dept head of the teacher
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    return this.prisma.teacherScientificReport.update({
      where: { id: reportId },
      data: {
        status: 'validated',
        validatedAt: new Date(),
        validatedBy: userId,
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
  }

  /**
   * Reject a report
   */
  async rejectReport(reportId: number, userId: number) {
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

    // Check if user is admin or dept head of the teacher
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    return this.prisma.teacherScientificReport.update({
      where: { id: reportId },
      data: {
        status: 'rejected',
        validatedAt: new Date(),
        validatedBy: userId,
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
  }

  /**
   * Get progress overview for a specific task
   */
  async getTaskProgress(taskId: number, userId: number) {
    // Check if user has access to this task
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

  /**
   * Helper: Check if user has access to a task
   */
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
      return; // Admin has access to all tasks
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
      // Check if teacher has a report for this task
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
