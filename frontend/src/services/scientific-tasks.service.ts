import api from '../config/api';
import type { ApiResponse, ScientificTask, TeacherScientificReport } from '../types';

export interface CreateScientificTaskRequest {
  taskName: string;
  taskDescription?: string;
  deadline: string;
}

export interface UpdateScientificTaskRequest {
  taskName?: string;
  taskDescription?: string;
  deadline?: string;
  isActive?: boolean;
}

export interface UpdateReportRequest {
  executionStatus?: string;
  completionPercentage?: number;
  filePath?: string;
  fileName?: string;
}

class ScientificTasksService {
  // ==================== TASK ENDPOINTS ====================

  async createTask(data: CreateScientificTaskRequest): Promise<ScientificTask> {
    const response = await api.post<ApiResponse<ScientificTask>>(
      '/scientific-tasks',
      data
    );
    return response.data.data;
  }

  async getAllTasks(): Promise<ScientificTask[]> {
    const response = await api.get<ApiResponse<ScientificTask[]>>(
      '/scientific-tasks'
    );
    return response.data.data;
  }

  async getTask(id: number): Promise<ScientificTask> {
    const response = await api.get<ApiResponse<ScientificTask>>(
      `/scientific-tasks/${id}`
    );
    return response.data.data;
  }

  async updateTask(id: number, data: UpdateScientificTaskRequest): Promise<ScientificTask> {
    const response = await api.patch<ApiResponse<ScientificTask>>(
      `/scientific-tasks/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/scientific-tasks/${id}`);
  }

  async getTaskProgress(id: number): Promise<ScientificTask> {
    const response = await api.get<ApiResponse<ScientificTask>>(
      `/scientific-tasks/${id}/progress`
    );
    return response.data.data;
  }

  // ==================== REPORT ENDPOINTS ====================

  async getMyReports(): Promise<TeacherScientificReport[]> {
    const response = await api.get<ApiResponse<TeacherScientificReport[]>>(
      '/scientific-tasks/reports/my'
    );
    return response.data.data;
  }

  async getSubmittedReports(): Promise<TeacherScientificReport[]> {
    const response = await api.get<ApiResponse<TeacherScientificReport[]>>(
      '/scientific-tasks/reports/submitted'
    );
    return response.data.data;
  }

  async getReport(id: number): Promise<TeacherScientificReport> {
    const response = await api.get<ApiResponse<TeacherScientificReport>>(
      `/scientific-tasks/reports/${id}`
    );
    return response.data.data;
  }

  async updateReport(id: number, data: UpdateReportRequest): Promise<TeacherScientificReport> {
    const response = await api.patch<ApiResponse<TeacherScientificReport>>(
      `/scientific-tasks/reports/${id}`,
      data
    );
    return response.data.data;
  }

  async submitReport(id: number): Promise<TeacherScientificReport> {
    const response = await api.post<ApiResponse<TeacherScientificReport>>(
      `/scientific-tasks/reports/${id}/submit`
    );
    return response.data.data;
  }

  async validateReport(id: number): Promise<TeacherScientificReport> {
    const response = await api.post<ApiResponse<TeacherScientificReport>>(
      `/scientific-tasks/reports/${id}/validate`
    );
    return response.data.data;
  }

  async rejectReport(id: number): Promise<TeacherScientificReport> {
    const response = await api.post<ApiResponse<TeacherScientificReport>>(
      `/scientific-tasks/reports/${id}/reject`
    );
    return response.data.data;
  }

  // ==================== FILE UPLOAD ====================

  async uploadFile(file: File): Promise<{ filePath: string; fileName: string }> {
    console.log('uploadFile service called with:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const formData = new FormData();
    formData.append('file', file);

    console.log('FormData created, entries:', Array.from(formData.entries()).map(([key, value]) => ({
      key,
      value: value instanceof File ? `File: ${value.name}` : value
    })));

    // IMPORTANT: Delete the default Content-Type header to let axios automatically set
    // multipart/form-data with the required boundary parameter
    console.log('Sending POST request to /scientific-tasks/reports/upload');
    const response = await api.post<ApiResponse<{ filePath: string; fileName: string }>>(
      '/scientific-tasks/reports/upload',
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
      }
    );
    console.log('Upload response received:', response.data);
    return response.data.data;
  }
}

export default new ScientificTasksService();
