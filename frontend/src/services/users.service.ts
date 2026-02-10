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

export interface CreateTeacherRequest {
  login: string;
  firstName: string;
  lastName: string;
  email1?: string;
  email2?: string;
  phone1?: string;
  phone2?: string;
}

export interface UpdateTeacherInfoRequest {
  employmentType?: string;
  mandatoryHoursPerPeriod?: number;
  mandatoryExtracurricularHours?: number;
  mandatoryConferenceArticles?: number;
  mandatoryNationalArticles?: number;
  mandatoryScopusArticles?: number;
  mandatoryDocumentation?: number;
}

export interface UpdateUserAccountRequest {
  // Personal Information
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  countryOfBirth?: string;
  regionOfBirth?: string;
  currentAddress?: string;
  permanentAddress?: string;
  passportSerial?: string;
  personalId?: string;
  stirInn?: string;
  englishLevel?: string;
  profileImage?: string;
  email1?: string;
  email2?: string;
  phone1?: string;
  phone2?: string;

  // Educational Background
  bachelorUniversity?: string;
  bachelorYear?: number;
  bachelorDirection?: string;
  bachelorDiplomaNumber?: string;
  masterUniversity?: string;
  masterYear?: number;
  masterDirection?: string;
  masterDiplomaNumber?: string;

  // Research
  researchArea?: string;

  // PhD Information
  hasPhdDegree?: boolean;
  phdYear?: number;
  phdSpeciality?: string;
  phdTopic?: string;
  phdDiplomaNumber?: string;
  phdCountry?: string;
  phdOrganization?: string;

  // DSc Information
  hasDscDegree?: boolean;
  dscYear?: number;
  dscSpeciality?: string;
  dscTopic?: string;
  dscDiplomaNumber?: string;
  dscCountry?: string;
  dscOrganization?: string;

  // Academic Title
  hasAcademicTitle?: boolean;
  academicTitleName?: string;
  academicTitleSpeciality?: string;
  academicTitleYear?: number;
  academicTitleAttestat?: string;

  // Training and Development
  internshipsCount?: number;
  internshipsInfo?: string;
  trainingCount?: number;
  trainingInfo?: string;

  // Awards and Recognition
  awardsField?: string;
  awardsState?: string;

  // Supervision
  supervisedPhd?: number;
  supervisedDsc?: number;

  // Conference and Seminar Participation
  conferencesRepublic?: number;
  conferencesInternational?: number;
  seminarsRepublic?: number;
  seminarsInternational?: number;

  // Projects
  projectsFundamental?: number;
  projectsPractical?: number;
  projectsYouth?: number;
  projectsBusiness?: number;
  projectsInnovation?: number;
  innovativeIdeasCount?: number;
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

  async createTeacher(data: CreateTeacherRequest): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users/teachers', data);
    return response.data.data;
  }

  async updateTeacherInfo(id: number, data: UpdateTeacherInfoRequest): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/teachers/${id}`, data);
    return response.data.data;
  }

  async updateAccount(id: number, data: UpdateUserAccountRequest): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/account`, data);
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
