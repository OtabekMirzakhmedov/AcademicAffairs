import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CourseTeachersService {
  constructor(private prisma: PrismaService) {}

  async getTeacherAssignments(teacherId: number) {
    // Get active academic period
    const activePeriod = await this.prisma.academicPeriod.findFirst({
      where: { isActive: true },
    });

    if (!activePeriod) {
      return [];
    }

    // Get course assignments for the active period
    const assignments = await this.prisma.courseTeacher.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return assignments;
  }
}
