import api from '../config/api';
import type { ApiResponse, AuditLog, AuditLogPage, AuditQuery } from '../types';

class AuditService {
  async findAll(query: AuditQuery = {}): Promise<AuditLogPage> {
    const params = new URLSearchParams();
    if (query.entityType) params.set('entityType', query.entityType);
    if (query.entityId != null) params.set('entityId', String(query.entityId));
    if (query.actorId != null) params.set('actorId', String(query.actorId));
    if (query.action) params.set('action', query.action);
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const response = await api.get<ApiResponse<AuditLogPage>>(
      `/audit-logs?${params.toString()}`,
    );
    return response.data.data;
  }

  async findByEntity(entityType: string, entityId: number): Promise<AuditLog[]> {
    const response = await api.get<ApiResponse<AuditLog[]>>(
      `/audit-logs/entity/${entityType}/${entityId}`,
    );
    return response.data.data;
  }

  async findByActor(actorId: number): Promise<AuditLog[]> {
    const response = await api.get<ApiResponse<AuditLog[]>>(
      `/audit-logs/actor/${actorId}`,
    );
    return response.data.data;
  }
}

export default new AuditService();
