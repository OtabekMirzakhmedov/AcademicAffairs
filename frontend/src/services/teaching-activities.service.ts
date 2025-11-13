import api from '../config/api';
import type { ApiResponse, TeachingActivity } from '../types';

export interface TeachingStatistics {
  mandatoryHours: number;
  submittedHours: number;
  validatedHours: number;
}

export interface CreateTeachingActivityRequest {
  courseTeacherId: number;
  courseId: number;
  academicPeriodId: number;
  groups: string[];
  lectureHours: number;
  practiceHours: number;
  labHours: number;
  seminarHours: number;
  advisingHours: number;
}

export interface UpdateTeachingActivityRequest {
  courseTeacherId?: number;
  courseId?: number;
  academicPeriodId?: number;
  groups?: string[];
  lectureHours?: number;
  practiceHours?: number;
  labHours?: number;
  seminarHours?: number;
  advisingHours?: number;
}

class TeachingActivitiesService {
  async getStatistics(academicPeriodId?: number): Promise<TeachingStatistics> {
    const params = academicPeriodId ? `?academicPeriodId=${academicPeriodId}` : '';
    const response = await api.get<ApiResponse<TeachingStatistics>>(`/teaching-activities/stats${params}`);
    return response.data.data;
  }

  async create(data: CreateTeachingActivityRequest): Promise<TeachingActivity> {
    const response = await api.post<ApiResponse<TeachingActivity>>(
      '/teaching-activities',
      data
    );
    return response.data.data;
  }

  async update(id: number, data: UpdateTeachingActivityRequest): Promise<TeachingActivity> {
    const response = await api.patch<ApiResponse<TeachingActivity>>(
      `/teaching-activities/${id}`,
      data
    );
    return response.data.data;
  }
}

export default new TeachingActivitiesService();
