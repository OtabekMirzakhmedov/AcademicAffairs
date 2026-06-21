import api from '../config/api';
import type { ApiResponse, TeacherPublication, PublicationStatistics } from '../types';

export interface CreatePublicationRequest {
  title: string;
  publicationType: 'conference' | 'national' | 'scopus';
  authors: string;
  venue?: string;
  publicationDate?: string;
  doi?: string;
  isbn?: string;
  issn?: string;
  url?: string;
  abstract?: string;
  keywords?: string;
}

export interface UpdatePublicationRequest {
  title?: string;
  publicationType?: 'conference' | 'national' | 'scopus';
  authors?: string;
  venue?: string;
  publicationDate?: string;
  doi?: string;
  isbn?: string;
  issn?: string;
  url?: string;
  abstract?: string;
  keywords?: string;
}

class PublicationsService {
  async getAll(): Promise<TeacherPublication[]> {
    const response = await api.get<ApiResponse<TeacherPublication[]>>('/publications');
    return response.data.data;
  }

  async getOne(id: number): Promise<TeacherPublication> {
    const response = await api.get<ApiResponse<TeacherPublication>>(`/publications/${id}`);
    return response.data.data;
  }

  async create(data: CreatePublicationRequest): Promise<TeacherPublication> {
    const response = await api.post<ApiResponse<TeacherPublication>>('/publications', data);
    return response.data.data;
  }

  async update(id: number, data: UpdatePublicationRequest): Promise<TeacherPublication> {
    const response = await api.patch<ApiResponse<TeacherPublication>>(`/publications/${id}`, data);
    return response.data.data;
  }

  async submit(id: number): Promise<TeacherPublication> {
    const response = await api.patch<ApiResponse<TeacherPublication>>(`/publications/${id}/submit`);
    return response.data.data;
  }

  async getAllSubmitted(): Promise<TeacherPublication[]> {
    const response = await api.get<ApiResponse<TeacherPublication[]>>('/publications/submitted/all');
    return response.data.data;
  }

  async validate(id: number): Promise<TeacherPublication> {
    const response = await api.post<ApiResponse<TeacherPublication>>(`/publications/${id}/validate`);
    return response.data.data;
  }

  async reject(id: number, reason?: string): Promise<TeacherPublication> {
    const response = await api.post<ApiResponse<TeacherPublication>>(`/publications/${id}/reject`, { reason });
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/publications/${id}`);
  }

  async getStatistics(): Promise<PublicationStatistics> {
    const response = await api.get<ApiResponse<PublicationStatistics>>('/publications/statistics');
    return response.data.data;
  }
}

export default new PublicationsService();
