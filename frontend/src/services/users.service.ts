import api from '../config/api';
import type { ApiResponse, User } from '../types';

export interface CreateUserRequest {
  login: string;
  password: string;
  roleId: number;
  firstName: string;
  lastName: string;
  email1?: string;
  email2?: string;
  phone1?: string;
  phone2?: string;
  departmentId?: number;
}

export interface UpdateUserRequest {
  login?: string;
  roleId?: number;
  firstName?: string;
  lastName?: string;
  email1?: string;
  email2?: string;
  phone1?: string;
  phone2?: string;
  departmentId?: number;
}

class UsersService {
  async getAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  }

  async getOne(id: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  }

  async create(data: CreateUserRequest): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  }

  async update(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  }

  async toggleStatus(id: number): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(
      `/users/${id}/toggle-status`
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  }
}

export default new UsersService();
