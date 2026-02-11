import api from '../config/api';
import type {
  ApiResponse,
  ResearchActivityTemplate,
  TeacherResearchActivity,
} from '../types';

export interface CreateResearchActivityRequest {
  templateId: number;
  deadline?: string;
}

export interface UpdateResearchActivityRequest {
  completionPercentage?: number;
  filePath?: string;
  fileName?: string;
  deadline?: string;
}

const researchActivitiesService = {
  async getTemplates(category?: string): Promise<ResearchActivityTemplate[]> {
    const params = category ? { category } : {};
    const response = await api.get<ApiResponse<ResearchActivityTemplate[]>>(
      '/research-activities/templates',
      { params },
    );
    return response.data.data;
  },

  async getMyActivities(): Promise<TeacherResearchActivity[]> {
    const response = await api.get<ApiResponse<TeacherResearchActivity[]>>(
      '/research-activities/my',
    );
    return response.data.data;
  },

  async create(
    data: CreateResearchActivityRequest,
  ): Promise<TeacherResearchActivity> {
    const response = await api.post<ApiResponse<TeacherResearchActivity>>(
      '/research-activities',
      data,
    );
    return response.data.data;
  },

  async update(
    id: number,
    data: UpdateResearchActivityRequest,
  ): Promise<TeacherResearchActivity> {
    const response = await api.patch<ApiResponse<TeacherResearchActivity>>(
      `/research-activities/${id}`,
      data,
    );
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/research-activities/${id}`);
  },

  async submit(id: number): Promise<TeacherResearchActivity> {
    const response = await api.post<ApiResponse<TeacherResearchActivity>>(
      `/research-activities/${id}/submit`,
    );
    return response.data.data;
  },

  async uploadFile(file: File): Promise<{ filePath: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<
      ApiResponse<{ filePath: string; fileName: string }>
    >('/research-activities/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getDownloadUrl(id: number): string {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}/research-activities/${id}/download`;
  },

  // ==================== ADMIN TEMPLATE MANAGEMENT ====================

  async getAllTemplatesAdmin(): Promise<(ResearchActivityTemplate & { _count: { teacherActivities: number } })[]> {
    const response = await api.get<ApiResponse<any[]>>(
      '/research-activities/templates/admin',
    );
    return response.data.data;
  },

  async createTemplate(data: Partial<ResearchActivityTemplate>): Promise<ResearchActivityTemplate> {
    const response = await api.post<ApiResponse<ResearchActivityTemplate>>(
      '/research-activities/templates',
      data,
    );
    return response.data.data;
  },

  async updateTemplate(id: number, data: Partial<ResearchActivityTemplate>): Promise<ResearchActivityTemplate> {
    const response = await api.patch<ApiResponse<ResearchActivityTemplate>>(
      `/research-activities/templates/${id}`,
      data,
    );
    return response.data.data;
  },

  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/research-activities/templates/${id}`);
  },
};

export default researchActivitiesService;
