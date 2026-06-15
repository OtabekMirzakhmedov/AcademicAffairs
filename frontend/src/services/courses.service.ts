import api from '../config/api';
import type { ApiResponse, Course } from '../types';

export interface CreateCourseRequest {
  name: string;
  departmentId: number;
  lectureHours?: number;
  practiceHours?: number;
  teacherId?: number;
  academicPeriodId?: number;
  groups?: string[];
}

export interface UpdateCourseRequest {
  name?: string;
  lectureHours?: number;
  practiceHours?: number;
}

class CoursesService {
  async getAll(): Promise<Course[]> {
    const response = await api.get<ApiResponse<Course[]>>('/courses');
    return response.data.data;
  }

  async getOne(id: number): Promise<Course> {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data;
  }

  async create(data: CreateCourseRequest): Promise<Course> {
    const response = await api.post<ApiResponse<Course>>('/courses', data);
    return response.data.data;
  }

  async update(id: number, data: UpdateCourseRequest): Promise<Course> {
    const response = await api.patch<ApiResponse<Course>>(
      `/courses/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/courses/${id}`);
  }
}

export default new CoursesService();
