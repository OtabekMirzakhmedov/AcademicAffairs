import api from '../config/api';
import type { ApiResponse, AcademicPeriod } from '../types';

class AcademicPeriodsService {
  async getActive(): Promise<AcademicPeriod> {
    const response = await api.get<ApiResponse<AcademicPeriod>>('/academic-periods/active');
    return response.data.data;
  }

  async getAll(): Promise<AcademicPeriod[]> {
    const response = await api.get<ApiResponse<AcademicPeriod[]>>('/academic-periods');
    return response.data.data;
  }
}

export default new AcademicPeriodsService();
