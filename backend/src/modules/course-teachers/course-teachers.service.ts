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
import { CreateCourseTeacherDto } from './dto/create-course-teacher.dto';
import { UpdateCourseTeacherDto } from './dto/update-course-teacher.dto';

@Injectable()
export class CourseTeachersService {
  private readonly logger = new Logger(CourseTeachersService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(createDto: CreateCourseTeacherDto, actor: AuditActor) {
    const course = await this.prisma.course.findUnique({
      where: { id: createDto.courseId },
      include: { department: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.department.headId !== actor.id) {
      throw new ForbiddenException(
        'You can only assign teachers to courses in your department',
      );
    }

    const teacher = await this.prisma.user.findUnique({
      where: { id: createDto.teacherId },
      include: {
        role: true,
        teacherInfo: true,
      },
    });

    if (!teacher || teacher.role.name !== 'teacher') {
      throw new NotFoundException('Teacher not found');
    }

    const academicPeriod = await this.prisma.academicPeriod.findUnique({
      where: { id: createDto.academicPeriodId },
    });

    if (!academicPeriod) {
      throw new NotFoundException('Academic period not found');
    }

    const existingAssignment = await this.prisma.courseTeacher.findFirst({
      where: {
        courseId: createDto.courseId,
        teacherId: createDto.teacherId,
        academicPeriodId: createDto.academicPeriodId,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        'This teacher is already assigned to this course for the specified period',
      );
    }

    const assignment = await this.prisma.courseTeacher.create({
      data: {
        courseId: createDto.courseId,
        teacherId: createDto.teacherId,
        academicPeriodId: createDto.academicPeriodId,
        groups: createDto.groups && createDto.groups.length > 0 ? createDto.groups : undefined,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        teacher: {
          include: {
            userInfo: true,
            teacherInfo: true,
          },
        },
        academicPeriod: true,
      },
    });

    await this.audit.log(actor, 'assign', 'CourseTeacher', assignment.id, {
      after: {
        id: assignment.id,
        courseId: createDto.courseId,
        teacherId: createDto.teacherId,
        academicPeriodId: createDto.academicPeriodId,
      },
    });
    this.logger.log({ event: 'course_teacher.assigned', assignmentId: assignment.id, courseId: createDto.courseId, teacherId: createDto.teacherId, actorId: actor.id });

    return assignment;
  }

  async findAll(userId: number, userRole: string, courseId?: number) {
    if (userRole === 'admin') {
      return await this.prisma.courseTeacher.findMany({
        where: courseId ? { courseId } : undefined,
        include: {
          course: {
            include: {
              department: true,
            },
          },
          teacher: {
            include: {
              userInfo: true,
              teacherInfo: true,
            },
          },
          academicPeriod: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userRole === 'departmenthead') {
      const department = await this.prisma.department.findFirst({
        where: { headId: userId },
      });

      if (!department) {
        throw new ForbiddenException('You are not a department head');
      }

      return await this.prisma.courseTeacher.findMany({
        where: {
          course: {
            departmentId: department.id,
          },
          ...(courseId && { courseId }),
        },
        include: {
          course: {
            include: {
              department: true,
            },
          },
          teacher: {
            include: {
              userInfo: true,
              teacherInfo: true,
            },
          },
          academicPeriod: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return await this.prisma.courseTeacher.findMany({
      where: {
        teacherId: userId,
        ...(courseId && { courseId }),
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        teacher: {
          include: {
            userInfo: true,
            teacherInfo: true,
          },
        },
        academicPeriod: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number, userRole: string) {
    const assignment = await this.prisma.courseTeacher.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        teacher: {
          include: {
            userInfo: true,
            teacherInfo: true,
          },
        },
        academicPeriod: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (userRole === 'admin') {
      return assignment;
    }

    if (userRole === 'departmenthead') {
      if (assignment.course.department.headId !== userId) {
        throw new ForbiddenException(
          'You can only view assignments in your department',
        );
      }
      return assignment;
    }

    if (assignment.teacherId !== userId) {
      throw new ForbiddenException('You can only view your own assignments');
    }

    return assignment;
  }

  async update(
    id: number,
    updateDto: UpdateCourseTeacherDto,
    userId: number,
    userRole: string,
  ) {
    const assignment = await this.prisma.courseTeacher.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (userRole !== 'admin' && userRole !== 'departmenthead') {
      throw new ForbiddenException('Only department heads can update assignments');
    }

    if (
      userRole === 'departmenthead' &&
      assignment.course.department.headId !== userId
    ) {
      throw new ForbiddenException(
        'You can only update assignments in your department',
      );
    }

    return await this.prisma.courseTeacher.update({
      where: { id },
      data: {
        groups: updateDto.groups,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        teacher: {
          include: {
            userInfo: true,
            teacherInfo: true,
          },
        },
        academicPeriod: true,
      },
    });
  }

  async remove(id: number, actor: AuditActor, userRole: string) {
    const assignment = await this.prisma.courseTeacher.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        _count: {
          select: {
            teachingActivities: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (userRole !== 'admin' && userRole !== 'departmenthead') {
      throw new ForbiddenException('Only department heads can delete assignments');
    }

    if (
      userRole === 'departmenthead' &&
      assignment.course.department.headId !== actor.id
    ) {
      throw new ForbiddenException(
        'You can only delete assignments in your department',
      );
    }

    if (assignment._count.teachingActivities > 0) {
      throw new ForbiddenException(
        'Cannot delete assignment with existing teaching activities',
      );
    }

    const before = {
      id,
      courseId: assignment.courseId,
      teacherId: assignment.teacherId,
      academicPeriodId: assignment.academicPeriodId,
    };

    await this.prisma.courseTeacher.delete({
      where: { id },
    });

    await this.audit.log(actor, 'unassign', 'CourseTeacher', id, { before });
    this.logger.log({ event: 'course_teacher.unassigned', assignmentId: id, actorId: actor.id });

    return { message: 'Assignment removed successfully' };
  }

  async getTeacherAssignments(teacherId: number) {
    const activePeriod = await this.prisma.academicPeriod.findFirst({
      where: { isActive: true },
    });

    if (!activePeriod) {
      return [];
    }

    return await this.prisma.courseTeacher.findMany({
      where: {
        teacherId,
        academicPeriodId: activePeriod.id,
      },
      include: {
        course: {
          include: {
            department: true,
          },
        },
        academicPeriod: true,
        teachingActivities: {
          select: {
            id: true,
            groups: true,
            lectureHours: true,
            practiceHours: true,
            labHours: true,
            seminarHours: true,
            advisingHours: true,
            totalHours: true,
            status: true,
          },
        },
      },
    });
  }
}
