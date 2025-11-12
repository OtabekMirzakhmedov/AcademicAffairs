import api from '../config/api';
import type { ApiResponse, Department } from '../types';

export interface CreateDepartmentRequest {
  name: string;
  headId?: number;
  phone?: string;
  roomNumber?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  headId?: number;
  phone?: string;
  roomNumber?: string;
}

class DepartmentsService {
  async getAll(): Promise<Department[]> {
    const response = await api.get<ApiResponse<Department[]>>('/departments');
    return response.data.data;
  }

  async getOne(id: number): Promise<Department> {
    const response = await api.get<ApiResponse<Department>>(`/departments/${id}`);
    return response.data.data;
  }

  async create(data: CreateDepartmentRequest): Promise<Department> {
    const response = await api.post<ApiResponse<Department>>('/departments', data);
    return response.data.data;
  }

  async update(id: number, data: UpdateDepartmentRequest): Promise<Department> {
    const response = await api.patch<ApiResponse<Department>>(
      `/departments/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/departments/${id}`);
  }
}

export default new DepartmentsService();
