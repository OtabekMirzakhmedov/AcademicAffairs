import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditActor } from '../audit/interfaces/audit-actor.interface';
import { CreateResearchActivityDto } from './dto/create-research-activity.dto';
import { UpdateResearchActivityDto } from './dto/update-research-activity.dto';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class ResearchActivitiesService {
  private readonly logger = new Logger(ResearchActivitiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ==================== TEMPLATES ====================

  async getTemplates(category?: string) {
    return this.prisma.researchActivityTemplate.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: { id: 'asc' },
    });
  }

  async getAllTemplatesAdmin() {
    return this.prisma.researchActivityTemplate.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { teacherActivities: true } },
      },
    });
  }

  async createTemplate(dto: CreateTemplateDto) {
    return this.prisma.researchActivityTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        maxAmount: dto.maxAmount,
        penalty: dto.penalty,
        category: dto.category ?? 'scientific_main',
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateTemplate(id: number, dto: Partial<CreateTemplateDto>) {
    const template = await this.prisma.researchActivityTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException('Template not found');

    return this.prisma.researchActivityTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.maxAmount !== undefined ? { maxAmount: dto.maxAmount } : {}),
        ...(dto.penalty !== undefined ? { penalty: dto.penalty } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async deleteTemplate(id: number) {
    const template = await this.prisma.researchActivityTemplate.findUnique({
      where: { id },
      include: { _count: { select: { teacherActivities: true } } },
    });
    if (!template) throw new NotFoundException('Template not found');

    await this.prisma.researchActivityTemplate.delete({ where: { id } });
  }

  // ==================== TEACHER ACTIVITIES ====================

  async getMyActivities(userId: number) {
    return this.prisma.teacherResearchActivity.findMany({
      where: { teacherId: userId },
      include: {
        template: true,
        validator: {
          include: { userInfo: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addActivity(userId: number, dto: CreateResearchActivityDto) {
    const template = await this.prisma.researchActivityTemplate.findUnique({
      where: { id: dto.templateId },
    });
    if (!template) {
      throw new NotFoundException('Activity template not found');
    }

    const existing = await this.prisma.teacherResearchActivity.findUnique({
      where: {
        teacher_template_unique: {
          teacherId: userId,
          templateId: dto.templateId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('You have already added this activity');
    }

    return this.prisma.teacherResearchActivity.create({
      data: {
        teacherId: userId,
        templateId: dto.templateId,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
      include: { template: true },
    });
  }

  async updateActivity(
    id: number,
    userId: number,
    dto: UpdateResearchActivityDto,
  ) {
    const activity = await this.prisma.teacherResearchActivity.findUnique({
      where: { id },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.teacherId !== userId) {
      throw new ForbiddenException('You can only update your own activities');
    }
    if (activity.status === 'validated') {
      throw new ForbiddenException('Cannot update a validated activity');
    }

    return this.prisma.teacherResearchActivity.update({
      where: { id },
      data: {
        ...(dto.completionPercentage !== undefined
          ? { completionPercentage: dto.completionPercentage }
          : {}),
        ...(dto.filePath !== undefined ? { filePath: dto.filePath } : {}),
        ...(dto.fileName !== undefined ? { fileName: dto.fileName } : {}),
        ...(dto.deadline !== undefined
          ? { deadline: dto.deadline ? new Date(dto.deadline) : null }
          : {}),
      },
      include: { template: true },
    });
  }

  async deleteActivity(id: number, userId: number) {
    const activity = await this.prisma.teacherResearchActivity.findUnique({
      where: { id },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.teacherId !== userId) {
      throw new ForbiddenException('You can only delete your own activities');
    }
    if (activity.status === 'validated') {
      throw new ForbiddenException('Cannot delete a validated activity');
    }

    await this.prisma.teacherResearchActivity.delete({ where: { id } });
  }

  async submitActivity(id: number, actor: AuditActor) {
    const activity = await this.prisma.teacherResearchActivity.findUnique({
      where: { id },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.teacherId !== actor.id) {
      throw new ForbiddenException('You can only submit your own activities');
    }
    if (activity.status !== 'in_progress' && activity.status !== 'rejected') {
      throw new ForbiddenException('Activity is not in a submittable state');
    }

    const before = { id: activity.id, status: activity.status };

    const result = await this.prisma.teacherResearchActivity.update({
      where: { id },
      data: { status: 'submitted', submittedAt: new Date() },
      include: { template: true },
    });

    await this.audit.log(actor, 'submit', 'TeacherResearchActivity', id, {
      before,
      after: { id, status: 'submitted' },
    });
    this.logger.log({
      event: 'research_activity.submitted',
      activityId: id,
      teacherId: actor.id,
    });

    return result;
  }

  private async assertValidatorScope(
    validatorId: number,
    activityTeacherId: number,
  ) {
    const [validator, teacherInfo] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: validatorId },
        include: { role: true, headedDepartments: true },
      }),
      this.prisma.teacherInfo.findUnique({
        where: { userId: activityTeacherId },
        select: { departmentId: true },
      }),
    ]);

    const roleName = validator?.role.name.toLowerCase();

    if (roleName === 'admin') return;

    if (roleName === 'departmenthead') {
      const headedDeptId = validator?.headedDepartments[0]?.id;
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

  async validateActivity(id: number, actor: AuditActor) {
    const activity = await this.prisma.teacherResearchActivity.findUnique({
      where: { id },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.status !== 'submitted') {
      throw new ForbiddenException('Activity is not submitted for validation');
    }

    await this.assertValidatorScope(actor.id, activity.teacherId);

    const before = { id: activity.id, status: activity.status };

    const result = await this.prisma.teacherResearchActivity.update({
      where: { id },
      data: {
        status: 'validated',
        validatedAt: new Date(),
        validatedBy: actor.id,
      },
      include: { template: true },
    });

    await this.audit.log(actor, 'validate', 'TeacherResearchActivity', id, {
      before,
      after: { id, status: 'validated', validatedBy: actor.id },
    });
    this.logger.log({
      event: 'research_activity.validated',
      activityId: id,
      validatorId: actor.id,
      teacherId: activity.teacherId,
    });

    return result;
  }

  async rejectActivity(id: number, actor: AuditActor) {
    const activity = await this.prisma.teacherResearchActivity.findUnique({
      where: { id },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.status !== 'submitted') {
      throw new ForbiddenException('Activity is not submitted');
    }

    await this.assertValidatorScope(actor.id, activity.teacherId);

    const before = { id: activity.id, status: activity.status };

    const result = await this.prisma.teacherResearchActivity.update({
      where: { id },
      data: {
        status: 'rejected',
        validatedBy: actor.id,
      },
      include: { template: true },
    });

    await this.audit.log(actor, 'reject', 'TeacherResearchActivity', id, {
      before,
      after: { id, status: 'rejected', validatedBy: actor.id },
    });
    this.logger.log({
      event: 'research_activity.rejected',
      activityId: id,
      validatorId: actor.id,
      teacherId: activity.teacherId,
    });

    return result;
  }
}
