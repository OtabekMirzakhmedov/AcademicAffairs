import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, userId: number) {
    // Verify user is head of the department
    const department = await this.prisma.department.findUnique({
      where: { id: createCourseDto.departmentId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (department.headId !== userId) {
      throw new ForbiddenException(
        'You can only create courses for your department',
      );
    }

    return await this.prisma.course.create({
      data: createCourseDto,
      include: {
        department: true,
        _count: {
          select: {
            assignedTeachers: true,
          },
        },
      },
    });
  }

  async findAll(userId: number, userRole: string) {
    // Admin can see all courses
    if (userRole === 'admin') {
      return await this.prisma.course.findMany({
        include: {
          department: true,
          _count: {
            select: {
              assignedTeachers: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    // Department head sees only their department's courses
    if (userRole === 'departmenthead') {
      const department = await this.prisma.department.findFirst({
        where: { headId: userId },
      });

      if (!department) {
        throw new ForbiddenException('You are not a department head');
      }

      return await this.prisma.course.findMany({
        where: { departmentId: department.id },
        include: {
          department: true,
          _count: {
            select: {
              assignedTeachers: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    // Teachers see only courses they're assigned to
    const assignments = await this.prisma.courseTeacher.findMany({
      where: { teacherId: userId },
      include: {
        course: {
          include: {
            department: true,
            _count: {
              select: {
                assignedTeachers: true,
              },
            },
          },
        },
      },
    });

    return assignments.map((assignment) => assignment.course);
  }

  async findOne(id: number, userId: number, userRole: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: {
          include: {
            head: {
              include: {
                userInfo: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignedTeachers: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Admin can see any course
    if (userRole === 'admin') {
      return course;
    }

    // Department head can only see courses in their department
    if (userRole === 'departmenthead') {
      if (course.department.headId !== userId) {
        throw new ForbiddenException(
          'You can only view courses in your department',
        );
      }
      return course;
    }

    // Teachers can only see courses they're assigned to
    const assignment = await this.prisma.courseTeacher.findFirst({
      where: {
        courseId: id,
        teacherId: userId,
      },
    });

    if (!assignment) {
      throw new ForbiddenException('You can only view courses assigned to you');
    }

    return course;
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    userId: number,
    userRole: string,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only admin or department head can update
    if (userRole !== 'admin' && userRole !== 'departmenthead') {
      throw new ForbiddenException('Only department heads can update courses');
    }

    // Department head can only update courses in their department
    if (userRole === 'departmenthead' && course.department.headId !== userId) {
      throw new ForbiddenException(
        'You can only update courses in your department',
      );
    }

    return await this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        department: true,
        _count: {
          select: {
            assignedTeachers: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number, userRole: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
        _count: {
          select: {
            assignedTeachers: true,
            teachingActivities: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only admin or department head can delete
    if (userRole !== 'admin' && userRole !== 'departmenthead') {
      throw new ForbiddenException('Only department heads can delete courses');
    }

    // Department head can only delete courses in their department
    if (userRole === 'departmenthead' && course.department.headId !== userId) {
      throw new ForbiddenException(
        'You can only delete courses in your department',
      );
    }

    // Prevent deletion if there are teacher assignments or activities
    if (
      course._count.assignedTeachers > 0 ||
      course._count.teachingActivities > 0
    ) {
      throw new ForbiddenException(
        'Cannot delete course with existing teacher assignments or activities',
      );
    }

    return await this.prisma.course.delete({
      where: { id },
    });
  }
}
