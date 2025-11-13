import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseTeacherDto } from './dto/create-course-teacher.dto';
import { UpdateCourseTeacherDto } from './dto/update-course-teacher.dto';

@Injectable()
export class CourseTeachersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCourseTeacherDto, userId: number) {
    // Verify course exists and user is department head
    const course = await this.prisma.course.findUnique({
      where: { id: createDto.courseId },
      include: { department: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.department.headId !== userId) {
      throw new ForbiddenException(
        'You can only assign teachers to courses in your department',
      );
    }

    // Verify teacher exists
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

    // Verify academic period exists
    const academicPeriod = await this.prisma.academicPeriod.findUnique({
      where: { id: createDto.academicPeriodId },
    });

    if (!academicPeriod) {
      throw new NotFoundException('Academic period not found');
    }

    // Check if assignment already exists
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

    return await this.prisma.courseTeacher.create({
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
  }

  async findAll(userId: number, userRole: string, courseId?: number) {
    // Admin can see all assignments
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

    // Department head sees assignments for their department's courses
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

    // Teachers see only their own assignments
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

    // Admin can see any assignment
    if (userRole === 'admin') {
      return assignment;
    }

    // Department head can see assignments in their department
    if (userRole === 'departmenthead') {
      if (assignment.course.department.headId !== userId) {
        throw new ForbiddenException(
          'You can only view assignments in your department',
        );
      }
      return assignment;
    }

    // Teachers can only see their own assignments
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

    // Only admin or department head can update
    if (userRole !== 'admin' && userRole !== 'departmenthead') {
      throw new ForbiddenException('Only department heads can update assignments');
    }

    // Department head can only update assignments in their department
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

  async remove(id: number, userId: number, userRole: string) {
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

    // Only admin or department head can delete
    if (userRole !== 'admin' && userRole !== 'departmenthead') {
      throw new ForbiddenException('Only department heads can delete assignments');
    }

    // Department head can only delete assignments in their department
    if (
      userRole === 'departmenthead' &&
      assignment.course.department.headId !== userId
    ) {
      throw new ForbiddenException(
        'You can only delete assignments in your department',
      );
    }

    // Prevent deletion if there are teaching activities
    if (assignment._count.teachingActivities > 0) {
      throw new ForbiddenException(
        'Cannot delete assignment with existing teaching activities',
      );
    }

    return await this.prisma.courseTeacher.delete({
      where: { id },
    });
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
            totalHours: true,
            status: true,
          },
        },
      },
    });
  }
}
