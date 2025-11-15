import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Injectable()
export class PublicationsService {
  constructor(private prisma: PrismaService) {}

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

  async update(id: number, teacherId: number, updatePublicationDto: UpdatePublicationDto) {
    // Verify ownership
    const publication = await this.findOne(id);
    if (publication.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own publications');
    }

    // Only allow updates if status is draft or rejected
    if (publication.status !== 'draft' && publication.status !== 'rejected') {
      throw new ForbiddenException('Cannot update submitted or validated publications');
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

  async submit(id: number, teacherId: number) {
    const publication = await this.findOne(id);
    if (publication.teacherId !== teacherId) {
      throw new ForbiddenException('You can only submit your own publications');
    }

    if (publication.status !== 'draft' && publication.status !== 'rejected') {
      throw new ForbiddenException('Publication already submitted');
    }

    return this.prisma.teacherPublication.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
    });
  }

  async remove(id: number, teacherId: number) {
    const publication = await this.findOne(id);
    if (publication.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own publications');
    }

    // Only allow deletes if status is draft or rejected
    if (publication.status !== 'draft' && publication.status !== 'rejected') {
      throw new ForbiddenException('Cannot delete submitted or validated publications');
    }

    await this.prisma.teacherPublication.delete({
      where: { id },
    });

    return { message: 'Publication deleted successfully' };
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
      mandatoryConferenceArticles: user.teacherInfo.mandatoryConferenceArticles || 0,
      mandatoryNationalArticles: user.teacherInfo.mandatoryNationalArticles || 0,
      mandatoryScopusArticles: user.teacherInfo.mandatoryScopusArticles || 0,
      submittedConferenceArticles: publications.filter(
        (p) => p.publicationType === 'conference' && p.status === 'submitted'
      ).length,
      submittedNationalArticles: publications.filter(
        (p) => p.publicationType === 'national' && p.status === 'submitted'
      ).length,
      submittedScopusArticles: publications.filter(
        (p) => p.publicationType === 'scopus' && p.status === 'submitted'
      ).length,
      validatedConferenceArticles: publications.filter(
        (p) => p.publicationType === 'conference' && p.status === 'validated'
      ).length,
      validatedNationalArticles: publications.filter(
        (p) => p.publicationType === 'national' && p.status === 'validated'
      ).length,
      validatedScopusArticles: publications.filter(
        (p) => p.publicationType === 'scopus' && p.status === 'validated'
      ).length,
    };

    return stats;
  }
}
