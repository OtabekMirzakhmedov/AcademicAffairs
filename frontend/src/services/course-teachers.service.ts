import api from '../config/api';
import type { ApiResponse, CourseTeacher } from '../types';

export interface CreateCourseTeacherRequest {
  courseId: number;
  teacherId: number;
  academicPeriodId: number;
  groups?: string[];
}

export interface UpdateCourseTeacherRequest {
  groups?: string[];
}

class CourseTeachersService {
  async getAll(courseId?: number): Promise<CourseTeacher[]> {
    const params = courseId ? { courseId } : undefined;
    const response = await api.get<ApiResponse<CourseTeacher[]>>(
      '/course-teachers',
      { params }
    );
    return response.data.data;
  }

  async getMyAssignments(): Promise<CourseTeacher[]> {
    const response = await api.get<ApiResponse<CourseTeacher[]>>(
        '/course-teachers/my-assignments'
    );
    return response.data.data;
  }

  async getOne(id: number): Promise<CourseTeacher> {
    const response = await api.get<ApiResponse<CourseTeacher>>(
      `/course-teachers/${id}`
    );
    return response.data.data;
  }

  async create(data: CreateCourseTeacherRequest): Promise<CourseTeacher> {
    const response = await api.post<ApiResponse<CourseTeacher>>(
      '/course-teachers',
      data
    );
    return response.data.data;
  }

  async update(
    id: number,
    data: UpdateCourseTeacherRequest
  ): Promise<CourseTeacher> {
    const response = await api.patch<ApiResponse<CourseTeacher>>(
      `/course-teachers/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/course-teachers/${id}`);
  }
}

export default new CourseTeachersService();
