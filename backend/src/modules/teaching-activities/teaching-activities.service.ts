import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeachingActivityDto } from './dto/create-teaching-activity.dto';
import { UpdateTeachingActivityDto } from './dto/update-teaching-activity.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TeachingActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(teacherId: number, dto: CreateTeachingActivityDto) {
    // Calculate total hours
    const totalHours =
      (dto.lectureHours || 0) +
      (dto.practiceHours || 0) +
      (dto.labHours || 0) +
      (dto.seminarHours || 0) +
      (dto.advisingHours || 0);

    const activity = await this.prisma.teachingActivity.create({
      data: {
        teacherId,
        courseTeacherId: dto.courseTeacherId,
        courseId: dto.courseId,
        academicPeriodId: dto.academicPeriodId,
        groups: dto.groups || [],
        lectureHours: new Decimal(dto.lectureHours || 0),
        practiceHours: new Decimal(dto.practiceHours || 0),
        labHours: new Decimal(dto.labHours || 0),
        seminarHours: new Decimal(dto.seminarHours || 0),
        advisingHours: new Decimal(dto.advisingHours || 0),
        totalHours: new Decimal(totalHours),
        status: 'draft',
      },
      include: {
        course: true,
        courseTeacher: {
          include: {
            course: true,
          },
        },
      },
    });

    return activity;
  }

  async findAll(teacherId: number, academicPeriodId?: number) {
    const where: any = {
      teacherId,
    };

    if (academicPeriodId) {
      where.academicPeriodId = academicPeriodId;
    }

    return this.prisma.teachingActivity.findMany({
      where,
      include: {
        course: true,
        courseTeacher: {
          include: {
            course: true,
          },
        },
        academicPeriod: true,
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

  async findOne(id: number, teacherId: number) {
    const activity = await this.prisma.teachingActivity.findUnique({
      where: { id },
      include: {
        course: true,
        courseTeacher: {
          include: {
            course: true,
          },
        },
        academicPeriod: true,
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

    if (!activity) {
      throw new NotFoundException('Teaching activity not found');
    }

    if (activity.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this activity');
    }

    return activity;
  }

  async update(
    id: number,
    teacherId: number,
    dto: UpdateTeachingActivityDto,
  ) {
    const activity = await this.findOne(id, teacherId);

    if (activity.status === 'validated' || activity.status === 'rejected') {
      throw new BadRequestException('Validated or rejected activities cannot be edited');
    }

    // Recalculate total hours if any hour fields are updated
    const totalHours =
      (dto.lectureHours !== undefined
        ? dto.lectureHours
        : Number(activity.lectureHours)) +
      (dto.practiceHours !== undefined
        ? dto.practiceHours
        : Number(activity.practiceHours)) +
      (dto.labHours !== undefined ? dto.labHours : Number(activity.labHours)) +
      (dto.seminarHours !== undefined
        ? dto.seminarHours
        : Number(activity.seminarHours)) +
      (dto.advisingHours !== undefined
        ? dto.advisingHours
        : Number(activity.advisingHours));

    const updateData: any = {
      ...dto,
      totalHours: new Decimal(totalHours),
    };

    // Convert number fields to Decimal
    if (dto.lectureHours !== undefined)
      updateData.lectureHours = new Decimal(dto.lectureHours);
    if (dto.practiceHours !== undefined)
      updateData.practiceHours = new Decimal(dto.practiceHours);
    if (dto.labHours !== undefined)
      updateData.labHours = new Decimal(dto.labHours);
    if (dto.seminarHours !== undefined)
      updateData.seminarHours = new Decimal(dto.seminarHours);
    if (dto.advisingHours !== undefined)
      updateData.advisingHours = new Decimal(dto.advisingHours);

    return this.prisma.teachingActivity.update({
      where: { id },
      data: updateData,
      include: {
        course: true,
        courseTeacher: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  async remove(id: number, teacherId: number) {
    const activity = await this.findOne(id, teacherId);

    if (activity.status !== 'draft') {
      throw new BadRequestException('Only draft activities can be deleted');
    }

    await this.prisma.teachingActivity.delete({
      where: { id },
    });

    return { message: 'Activity deleted successfully' };
  }

  async submit(id: number, teacherId: number) {
    const activity = await this.findOne(id, teacherId);

    if (activity.status === 'validated') {
      throw new BadRequestException('Validated activities cannot be resubmitted');
    }

    return this.prisma.teachingActivity.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
      include: {
        course: true,
      },
    });
  }

  async getStatistics(teacherId: number, academicPeriodId?: number) {
    const where: any = {
      teacherId,
    };

    if (academicPeriodId) {
      where.academicPeriodId = academicPeriodId;
    }

    // Get teacher info for mandatory hours
    const teacherInfo = await this.prisma.teacherInfo.findUnique({
      where: { userId: teacherId },
    });

    // Get submitted hours
    const submittedActivities = await this.prisma.teachingActivity.aggregate({
      where: {
        ...where,
        status: 'submitted',
      },
      _sum: {
        totalHours: true,
      },
    });

    // Get validated hours
    const validatedActivities = await this.prisma.teachingActivity.aggregate({
      where: {
        ...where,
        status: 'validated',
      },
      _sum: {
        totalHours: true,
      },
    });

    return {
      mandatoryHours: teacherInfo?.mandatoryHoursPerPeriod
        ? Number(teacherInfo.mandatoryHoursPerPeriod)
        : 0,
      submittedHours: submittedActivities._sum.totalHours
        ? Number(submittedActivities._sum.totalHours)
        : 0,
      validatedHours: validatedActivities._sum.totalHours
        ? Number(validatedActivities._sum.totalHours)
        : 0,
    };
  }

  private async assertValidatorScope(
    userId: number,
    activityTeacherId: number,
  ) {
    const [user, teacherInfo] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, headedDepartments: true },
      }),
      this.prisma.teacherInfo.findUnique({
        where: { userId: activityTeacherId },
        select: { departmentId: true },
      }),
    ]);

    const roleName = user?.role.name.toLowerCase();

    if (roleName === 'admin') return;

    if (roleName === 'departmenthead') {
      const headedDeptId = user?.headedDepartments[0]?.id;
      if (!headedDeptId || headedDeptId !== teacherInfo?.departmentId) {
        throw new ForbiddenException(
          'You can only act on activities from your department',
        );
      }
      return;
    }

    throw new ForbiddenException(
      'Only admins and department heads can perform this action',
    );
  }

  async getAllSubmitted(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, headedDepartments: true },
    });

    const roleName = user?.role.name.toLowerCase();

    const where: any = { status: 'submitted' };

    if (roleName === 'departmenthead') {
      const headedDeptId = user?.headedDepartments[0]?.id;
      if (!headedDeptId) {
        return [];
      }
      where.teacher = {
        teacherInfo: { departmentId: headedDeptId },
      };
    } else if (roleName !== 'admin') {
      throw new ForbiddenException(
        'Only admins and department heads can view submitted activities',
      );
    }

    return this.prisma.teachingActivity.findMany({
      where,
      include: {
        course: true,
        teacher: {
          include: {
            userInfo: true,
          },
        },
        academicPeriod: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async validate(id: number, userId: number) {
    const activity = await this.prisma.teachingActivity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException('Teaching activity not found');
    }

    if (activity.status !== 'submitted') {
      throw new BadRequestException('Only submitted activities can be validated');
    }

    await this.assertValidatorScope(userId, activity.teacherId);

    return this.prisma.teachingActivity.update({
      where: { id },
      data: {
        status: 'validated',
        validatedAt: new Date(),
        validatedBy: userId,
      },
      include: {
        course: true,
        teacher: {
          include: {
            userInfo: true,
          },
        },
      },
    });
  }

  async reject(id: number, userId: number) {
    const activity = await this.prisma.teachingActivity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException('Teaching activity not found');
    }

    if (activity.status !== 'submitted') {
      throw new BadRequestException('Only submitted activities can be rejected');
    }

    await this.assertValidatorScope(userId, activity.teacherId);

    return this.prisma.teachingActivity.update({
      where: { id },
      data: {
        status: 'rejected',
        validatedAt: new Date(),
        validatedBy: userId,
      },
      include: {
        course: true,
        teacher: {
          include: {
            userInfo: true,
          },
        },
      },
    });
  }
}
