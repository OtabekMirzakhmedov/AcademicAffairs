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
  locale?: string;
  profileImage?: string;
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
  mandatoryExtracurricularHours?: number;
  mandatoryConferenceArticles?: number;
  mandatoryNationalArticles?: number;
  mandatoryScopusArticles?: number;
  mandatoryDocumentation?: number;

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
  lectureHours: number;
  practiceHours: number;
  programCourses?: ProgramCourse[];
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
  teachingActivities?: TeachingActivity[];
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

// Programs
export interface Program {
  id: number;
  name: string;
  code: string;
  degreeLevel: string; // BACHELOR, MASTER, DOCTORATE, UNDERGRADUATE, GRADUATE
  departmentId: number;
  department?: Department;
  durationYears: number;
  totalCreditsRequired: number;
  description?: string;
  isActive: boolean;
  createdBy: number;
  creator?: User;
  createdAt: string;
  updatedAt: string;
  programCourses?: ProgramCourse[];
  _count?: {
    programCourses: number;
  };
}

export interface ProgramCourse {
  id: number;
  programId: number;
  program?: Program;
  courseId: number;
  course?: Course;
  isRequired: boolean;
  recommendedSemester?: number;
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

// Scientific Task Types
export interface ScientificTask {
  id: number;
  taskName: string;
  taskDescription?: string;
  deadline: string;
  createdBy: number;
  creator?: User;
  departmentId?: number;
  department?: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  reports?: TeacherScientificReport[];
  _count?: {
    reports: number;
  };
}

export interface TeacherScientificReport {
  id: number;
  scientificTaskId: number;
  scientificTask?: ScientificTask;
  teacherId: number;
  teacher?: User;
  executionStatus?: string;
  completionPercentage: number;
  equivalentHours: number;
  filePath?: string;
  fileName?: string;
  status: 'in_progress' | 'submitted' | 'validated' | 'rejected';
  submittedAt?: string;
  validatedAt?: string;
  validatedBy?: number;
  validator?: User;
  createdAt: string;
  updatedAt: string;
}

// Publication Types
export interface TeacherPublication {
  id: number;
  teacherId: number;
  teacher?: User;
  title: string;
  publicationType: 'conference' | 'national' | 'scopus';
  authors: string;
  venue?: string;
  publicationDate?: string;
  doi?: string;
  isbn?: string;
  issn?: string;
  url?: string;
  abstract?: string;
  keywords?: string;
  status: 'draft' | 'submitted' | 'validated' | 'rejected';
  submittedAt?: string;
  validatedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationStatistics {
  mandatoryConferenceArticles: number;
  mandatoryNationalArticles: number;
  mandatoryScopusArticles: number;
  submittedConferenceArticles: number;
  submittedNationalArticles: number;
  submittedScopusArticles: number;
  validatedConferenceArticles: number;
  validatedNationalArticles: number;
  validatedScopusArticles: number;
}

// Research Activity Types
export interface ResearchActivityTemplate {
  id: number;
  name: string;
  description?: string;
  maxAmount?: number;
  penalty?: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherResearchActivity {
  id: number;
  teacherId: number;
  templateId: number;
  template?: ResearchActivityTemplate;
  completionPercentage: number;
  filePath?: string;
  fileName?: string;
  status: 'in_progress' | 'submitted' | 'validated' | 'rejected';
  deadline?: string;
  submittedAt?: string;
  validatedAt?: string;
  validatedBy?: number;
  validator?: User;
  createdAt: string;
  updatedAt: string;
}
