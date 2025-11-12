import api from '../config/api';
import type {
  AuthResponse,
  LoginRequest,
  ChangePasswordRequest,
  User,
  ApiResponse,
} from '../types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    this.clearTokens();
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.post('/auth/change-password', data);
  }

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  }

  // Token management
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export default new AuthService();
