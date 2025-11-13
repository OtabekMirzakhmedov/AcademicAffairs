import api from '../config/api';
import type { ApiResponse } from '../types';

export interface TeachingStatistics {
  mandatoryHours: number;
  submittedHours: number;
  validatedHours: number;
}

class TeachingActivitiesService {
  async getStatistics(academicPeriodId?: number): Promise<TeachingStatistics> {
    const params = academicPeriodId ? `?academicPeriodId=${academicPeriodId}` : '';
    const response = await api.get<ApiResponse<TeachingStatistics>>(`/teaching-activities/stats${params}`);
    return response.data.data;
  }
}

export default new TeachingActivitiesService();
