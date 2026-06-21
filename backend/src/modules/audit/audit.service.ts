import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditActor } from './interfaces/audit-actor.interface';
import { AuditQueryDto } from './dto/audit-query.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    actor: AuditActor,
    action: string,
    entityType: string,
    entityId: number,
    opts?: { before?: object; after?: object; reason?: string },
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorLogin: actor.login,
        actorRole: actor.role,
        action,
        entityType,
        entityId,
        before: opts?.before ?? undefined,
        after: opts?.after ?? undefined,
        reason: opts?.reason,
      },
    });
  }

  async findAll(query: AuditQueryDto) {
    const { entityType, entityId, actorId, action, from, to, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = Number(entityId);
    if (actorId) where.actorId = Number(actorId);
    if (action) where.action = action;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { items, total, page, limit };
  }

  async findByEntity(entityType: string, entityId: number) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findByActor(actorId: number) {
    return this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
