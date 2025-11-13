// User and Authentication Types
export interface User {
  id: number;
  login: string;
  roleId: number;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  userInfo?: UserInfo;
  teacherInfo?: TeacherInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: 'admin' | 'departmenthead' | 'teacher';
  description?: string;
}

export interface UserInfo {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email1?: string;
  email2?: string;
  phone1?: string;
  phone2?: string;
}

export interface TeacherInfo {
  id: number;
  userId: number;
  employmentType?: 'full-time' | 'part-time' | 'contract';
  departmentId: number;
  department?: Department;
  mandatoryHoursPerPeriod?: number;
}

// Auth Response
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  login: string;
  password: string;
  rememberMe?: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Department Types
export interface Department {
  id: number;
  name: string;
  headId?: number;
  head?: User;
  phone?: string;
  roomNumber?: string;
  _count?: {
    teachers: number;
    courses: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Course Types
export interface Course {
  id: number;
  departmentId: number;
  department?: Department;
  name: string;
  _count?: {
    assignedTeachers: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourseTeacher {
  id: number;
  courseId: number;
  course?: Course;
  teacherId: number;
  teacher?: User;
  academicPeriodId: number;
  academicPeriod?: AcademicPeriod;
  groups?: string[];
  createdAt: string;
  updatedAt: string;
}

// Academic Period Types
export interface AcademicPeriod {
  id: number;
  academicYear: string;
  semester: number;
  teachingWeek: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// Teaching Activity Types
export interface TeachingActivity {
  id: number;
  courseTeacherId: number;
  courseTeacher?: CourseTeacher;
  teacherId: number;
  teacher?: User;
  courseId: number;
  course?: Course;
  academicPeriodId: number;
  academicPeriod?: AcademicPeriod;
  groups: string[];
  lectureHours: number;
  practiceHours: number;
  labHours: number;
  seminarHours: number;
  advisingHours: number;
  totalHours: number;
  status: 'draft' | 'submitted' | 'validated' | 'rejected';
  submittedAt?: string;
  validatedAt?: string;
  validatedBy?: number;
  validator?: User;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Statistics
export interface TeacherStats {
  mandatoryHours: number;
  submittedHours: number;
  validatedHours: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
