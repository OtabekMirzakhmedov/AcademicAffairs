import api from '../config/api';
import type { ApiResponse, CourseTeacher } from '../types';

class CourseTeachersService {
  async getMyAssignments(): Promise<CourseTeacher[]> {
    const response = await api.get<ApiResponse<CourseTeacher[]>>('/course-teachers/my-assignments');
    return response.data.data;
  }
}

export default new CourseTeachersService();
