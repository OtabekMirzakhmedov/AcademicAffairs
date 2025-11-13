import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcademicPeriodsService {
  constructor(private prisma: PrismaService) {}

  async getActive() {
    const activePeriod = await this.prisma.academicPeriod.findFirst({
      where: { isActive: true },
    });

    if (!activePeriod) {
      throw new NotFoundException('No active academic period found');
    }

    return activePeriod;
  }

  async findAll() {
    return await this.prisma.academicPeriod.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
