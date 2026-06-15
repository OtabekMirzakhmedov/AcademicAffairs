import api from '../config/api';
import type { ApiResponse, Program, ProgramCourse } from '../types';

export interface CreateProgramRequest {
  name: string;
  code: string;
  degreeLevel: string;
  departmentId: number;
  durationYears: number;
  totalCreditsRequired: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProgramRequest {
  name?: string;
  code?: string;
  degreeLevel?: string;
  departmentId?: number;
  durationYears?: number;
  totalCreditsRequired?: number;
  description?: string;
  isActive?: boolean;
}

export interface AddCourseToProgramRequest {
  courseId: number;
  isRequired?: boolean;
  recommendedSemester?: number;
}

class ProgramsService {
  async getAll(): Promise<Program[]> {
    const response = await api.get<ApiResponse<Program[]>>('/programs');
    return response.data.data;
  }

  async getOne(id: number): Promise<Program> {
    const response = await api.get<ApiResponse<Program>>(`/programs/${id}`);
    return response.data.data;
  }

  async create(data: CreateProgramRequest): Promise<Program> {
    const response = await api.post<ApiResponse<Program>>('/programs', data);
    return response.data.data;
  }

  async update(id: number, data: UpdateProgramRequest): Promise<Program> {
    const response = await api.patch<ApiResponse<Program>>(`/programs/${id}`, data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/programs/${id}`);
  }

  async addCourse(programId: number, data: AddCourseToProgramRequest): Promise<ProgramCourse> {
    const response = await api.post<ApiResponse<ProgramCourse>>(
      `/programs/${programId}/courses`,
      data
    );
    return response.data.data;
  }

  async removeCourse(programId: number, courseId: number): Promise<void> {
    await api.delete(`/programs/${programId}/courses/${courseId}`);
  }

  async updateProgramCourse(
    programId: number,
    courseId: number,
    data: { isRequired?: boolean; recommendedSemester?: number }
  ): Promise<ProgramCourse> {
    const response = await api.patch<ApiResponse<ProgramCourse>>(
      `/programs/${programId}/courses/${courseId}`,
      data
    );
    return response.data.data;
  }

}

export default new ProgramsService();
