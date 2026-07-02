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
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Injectable()
export class PublicationsService {
  private readonly logger = new Logger(PublicationsService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(teacherId: number, createPublicationDto: CreatePublicationDto) {
    return this.prisma.teacherPublication.create({
      data: {
        teacherId,
        ...createPublicationDto,
        publicationDate: createPublicationDto.publicationDate
          ? new Date(createPublicationDto.publicationDate)
          : null,
      },
    });
  }

  async findAllByTeacher(teacherId: number) {
    return this.prisma.teacherPublication.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const publication = await this.prisma.teacherPublication.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            userInfo: true,
          },
        },
      },
    });

    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    return publication;
  }

  async update(
    id: number,
    teacherId: number,
    updatePublicationDto: UpdatePublicationDto,
  ) {
    const publication = await this.findOne(id);
    if (publication.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own publications');
    }

    if (publication.status !== 'draft' && publication.status !== 'rejected') {
      throw new ForbiddenException(
        'Cannot update submitted or validated publications',
      );
    }

    return this.prisma.teacherPublication.update({
      where: { id },
      data: {
        ...updatePublicationDto,
        publicationDate: updatePublicationDto.publicationDate
          ? new Date(updatePublicationDto.publicationDate)
          : undefined,
      },
    });
  }

  async submit(id: number, actor: AuditActor) {
    const publication = await this.findOne(id);
    if (publication.teacherId !== actor.id) {
      throw new ForbiddenException('You can only submit your own publications');
    }

    if (publication.status !== 'draft' && publication.status !== 'rejected') {
      throw new ForbiddenException('Publication already submitted');
    }

    const before = { id: publication.id, status: publication.status };

    const result = await this.prisma.teacherPublication.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    await this.audit.log(actor, 'submit', 'TeacherPublication', id, {
      before,
      after: { id, status: 'submitted' },
    });
    this.logger.log({
      event: 'publication.submitted',
      publicationId: id,
      teacherId: actor.id,
    });

    return result;
  }

  async remove(id: number, teacherId: number) {
    const publication = await this.findOne(id);
    if (publication.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own publications');
    }

    if (publication.status !== 'draft' && publication.status !== 'rejected') {
      throw new ForbiddenException(
        'Cannot delete submitted or validated publications',
      );
    }

    await this.prisma.teacherPublication.delete({
      where: { id },
    });

    return { message: 'Publication deleted successfully' };
  }

  private async assertValidatorScope(
    validatorId: number,
    publicationTeacherId: number,
  ) {
    const [user, teacherInfo] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: validatorId },
        include: { role: true, headedDepartments: true },
      }),
      this.prisma.teacherInfo.findUnique({
        where: { userId: publicationTeacherId },
        select: { departmentId: true },
      }),
    ]);

    const roleName = user?.role.name.toLowerCase();

    if (roleName === 'admin') return;

    if (roleName === 'departmenthead') {
      const headedDeptId = user?.headedDepartments[0]?.id;
      if (!headedDeptId || headedDeptId !== teacherInfo?.departmentId) {
        throw new ForbiddenException(
          'You can only act on publications from your department',
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
      if (!headedDeptId) return [];
      where.teacher = { teacherInfo: { departmentId: headedDeptId } };
    } else if (roleName !== 'admin') {
      throw new ForbiddenException(
        'Only admins and department heads can view submitted publications',
      );
    }

    return this.prisma.teacherPublication.findMany({
      where,
      include: {
        teacher: { include: { userInfo: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async validate(id: number, actor: AuditActor) {
    const publication = await this.findOne(id);

    if (publication.status !== 'submitted') {
      throw new BadRequestException(
        'Only submitted publications can be validated',
      );
    }

    await this.assertValidatorScope(actor.id, publication.teacherId);

    const before = { id: publication.id, status: publication.status };

    const result = await this.prisma.teacherPublication.update({
      where: { id },
      data: {
        status: 'validated',
        validatedAt: new Date(),
        validatedBy: actor.id,
        rejectionReason: null,
      },
    });

    await this.audit.log(actor, 'validate', 'TeacherPublication', id, {
      before,
      after: { id, status: 'validated', validatedBy: actor.id },
    });
    this.logger.log({
      event: 'publication.validated',
      publicationId: id,
      validatorId: actor.id,
      teacherId: publication.teacherId,
    });

    return result;
  }

  async reject(id: number, actor: AuditActor, reason?: string) {
    const publication = await this.findOne(id);

    if (publication.status !== 'submitted') {
      throw new BadRequestException(
        'Only submitted publications can be rejected',
      );
    }

    await this.assertValidatorScope(actor.id, publication.teacherId);

    const before = { id: publication.id, status: publication.status };

    const result = await this.prisma.teacherPublication.update({
      where: { id },
      data: {
        status: 'rejected',
        validatedAt: new Date(),
        validatedBy: actor.id,
        rejectionReason: reason ?? null,
      },
    });

    await this.audit.log(actor, 'reject', 'TeacherPublication', id, {
      before,
      after: { id, status: 'rejected', validatedBy: actor.id },
      reason,
    });
    this.logger.log({
      event: 'publication.rejected',
      publicationId: id,
      validatorId: actor.id,
      teacherId: publication.teacherId,
    });

    return result;
  }

  async getStatistics(teacherId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
      include: {
        teacherInfo: true,
      },
    });

    if (!user || !user.teacherInfo) {
      throw new NotFoundException('Teacher not found');
    }

    const publications = await this.findAllByTeacher(teacherId);

    const stats = {
      mandatoryConferenceArticles:
        user.teacherInfo.mandatoryConferenceArticles || 0,
      mandatoryNationalArticles:
        user.teacherInfo.mandatoryNationalArticles || 0,
      mandatoryScopusArticles: user.teacherInfo.mandatoryScopusArticles || 0,
      submittedConferenceArticles: publications.filter(
        (p) => p.publicationType === 'conference' && p.status === 'submitted',
      ).length,
      submittedNationalArticles: publications.filter(
        (p) => p.publicationType === 'national' && p.status === 'submitted',
      ).length,
      submittedScopusArticles: publications.filter(
        (p) => p.publicationType === 'scopus' && p.status === 'submitted',
      ).length,
      validatedConferenceArticles: publications.filter(
        (p) => p.publicationType === 'conference' && p.status === 'validated',
      ).length,
      validatedNationalArticles: publications.filter(
        (p) => p.publicationType === 'national' && p.status === 'validated',
      ).length,
      validatedScopusArticles: publications.filter(
        (p) => p.publicationType === 'scopus' && p.status === 'validated',
      ).length,
    };

    return stats;
  }
}
