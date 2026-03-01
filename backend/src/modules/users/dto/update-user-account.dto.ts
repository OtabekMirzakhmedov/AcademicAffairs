import { IsString, IsOptional, IsDateString, IsInt, IsBoolean, Min, Max, IsEmail, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserAccountDto {
  // Personal Information
  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'William', description: 'Middle name' })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiPropertyOptional({ example: '1990-05-15', description: 'Date of birth (ISO format)' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'male', description: 'Gender', enum: ['male', 'female', 'other'] })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: 'Uzbek', description: 'Nationality' })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({ example: 'Uzbekistan', description: 'Country of birth' })
  @IsString()
  @IsOptional()
  countryOfBirth?: string;

  @ApiPropertyOptional({ example: 'Tashkent', description: 'Region of birth' })
  @IsString()
  @IsOptional()
  regionOfBirth?: string;

  @ApiPropertyOptional({ example: '123 Main St, Tashkent', description: 'Current address' })
  @IsString()
  @IsOptional()
  currentAddress?: string;

  @ApiPropertyOptional({ example: '456 Oak Ave, Samarkand', description: 'Permanent address' })
  @IsString()
  @IsOptional()
  permanentAddress?: string;

  // Identification
  @ApiPropertyOptional({ example: 'AA1234567', description: 'Passport serial number' })
  @IsString()
  @IsOptional()
  passportSerial?: string;

  @ApiPropertyOptional({ example: '12345678901234', description: 'Personal ID (14 digits)' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{14}$/, { message: 'Personal ID must be exactly 14 digits' })
  personalId?: string;

  @ApiPropertyOptional({ example: '123456789', description: 'STIR/INN number' })
  @IsString()
  @IsOptional()
  stirInn?: string;

  // Contact Information
  @ApiPropertyOptional({ example: 'john.doe@university.edu', description: 'Primary email' })
  @IsEmail()
  @IsOptional()
  email1?: string;

  @ApiPropertyOptional({ example: 'j.doe@gmail.com', description: 'Secondary email' })
  @IsEmail()
  @IsOptional()
  email2?: string;

  @ApiPropertyOptional({ example: '+998901234567', description: 'Primary phone' })
  @IsString()
  @IsOptional()
  phone1?: string;

  @ApiPropertyOptional({ example: '+998907654321', description: 'Secondary phone' })
  @IsString()
  @IsOptional()
  phone2?: string;

  // Language Proficiency
  @ApiPropertyOptional({ example: 'B2', description: 'English proficiency level', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] })
  @IsString()
  @IsOptional()
  englishLevel?: string;

  // Profile Image
  @ApiPropertyOptional({ example: '/uploads/profiles/avatar.jpg', description: 'Profile image path' })
  @IsString()
  @IsOptional()
  profileImage?: string;

  // Educational Background - Bachelor
  @ApiPropertyOptional({ example: 'Tashkent State University', description: 'Bachelor degree university' })
  @IsString()
  @IsOptional()
  bachelorUniversity?: string;

  @ApiPropertyOptional({ example: 2015, description: 'Bachelor graduation year' })
  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  bachelorYear?: number;

  @ApiPropertyOptional({ example: 'Computer Science', description: 'Bachelor field of study' })
  @IsString()
  @IsOptional()
  bachelorDirection?: string;

  @ApiPropertyOptional({ example: 'BS-12345', description: 'Bachelor diploma number' })
  @IsString()
  @IsOptional()
  bachelorDiplomaNumber?: string;

  // Educational Background - Master
  @ApiPropertyOptional({ example: 'National University', description: 'Master degree university' })
  @IsString()
  @IsOptional()
  masterUniversity?: string;

  @ApiPropertyOptional({ example: 2017, description: 'Master graduation year' })
  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  masterYear?: number;

  @ApiPropertyOptional({ example: 'Software Engineering', description: 'Master field of study' })
  @IsString()
  @IsOptional()
  masterDirection?: string;

  @ApiPropertyOptional({ example: 'MS-67890', description: 'Master diploma number' })
  @IsString()
  @IsOptional()
  masterDiplomaNumber?: string;

  // Research
  @ApiPropertyOptional({ example: 'Machine Learning, Natural Language Processing', description: 'Research area' })
  @IsString()
  @IsOptional()
  researchArea?: string;

  // PhD Information
  @ApiPropertyOptional({ example: true, description: 'Has PhD degree' })
  @IsBoolean()
  @IsOptional()
  hasPhdDegree?: boolean;

  @ApiPropertyOptional({ example: 2020, description: 'PhD award year' })
  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  phdYear?: number;

  @ApiPropertyOptional({ example: 'Artificial Intelligence', description: 'PhD speciality' })
  @IsString()
  @IsOptional()
  phdSpeciality?: string;

  @ApiPropertyOptional({ example: 'Deep Learning for Medical Imaging', description: 'PhD thesis topic' })
  @IsString()
  @IsOptional()
  phdTopic?: string;

  @ApiPropertyOptional({ example: 'PHD-11111', description: 'PhD diploma number' })
  @IsString()
  @IsOptional()
  phdDiplomaNumber?: string;

  @ApiPropertyOptional({ example: 'Uzbekistan', description: 'Country where PhD was obtained' })
  @IsString()
  @IsOptional()
  phdCountry?: string;

  @ApiPropertyOptional({ example: 'Academy of Sciences', description: 'PhD awarding organization' })
  @IsString()
  @IsOptional()
  phdOrganization?: string;

  // DSc Information
  @ApiPropertyOptional({ example: false, description: 'Has DSc degree' })
  @IsBoolean()
  @IsOptional()
  hasDscDegree?: boolean;

  @ApiPropertyOptional({ example: 2023, description: 'DSc award year' })
  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  dscYear?: number;

  @ApiPropertyOptional({ example: 'Computer Science', description: 'DSc speciality' })
  @IsString()
  @IsOptional()
  dscSpeciality?: string;

  @ApiPropertyOptional({ example: 'Advanced AI Systems', description: 'DSc thesis topic' })
  @IsString()
  @IsOptional()
  dscTopic?: string;

  @ApiPropertyOptional({ example: 'DSC-22222', description: 'DSc diploma number' })
  @IsString()
  @IsOptional()
  dscDiplomaNumber?: string;

  @ApiPropertyOptional({ example: 'Uzbekistan', description: 'Country where DSc was obtained' })
  @IsString()
  @IsOptional()
  dscCountry?: string;

  @ApiPropertyOptional({ example: 'Higher Attestation Commission', description: 'DSc awarding organization' })
  @IsString()
  @IsOptional()
  dscOrganization?: string;

  // Academic Title
  @ApiPropertyOptional({ example: true, description: 'Has academic title' })
  @IsBoolean()
  @IsOptional()
  hasAcademicTitle?: boolean;

  @ApiPropertyOptional({ example: 'Professor', description: 'Academic title name' })
  @IsString()
  @IsOptional()
  academicTitleName?: string;

  @ApiPropertyOptional({ example: 'Information Technology', description: 'Academic title speciality' })
  @IsString()
  @IsOptional()
  academicTitleSpeciality?: string;

  @ApiPropertyOptional({ example: 2022, description: 'Academic title award year' })
  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  academicTitleYear?: number;

  @ApiPropertyOptional({ example: 'AT-33333', description: 'Academic title attestat number' })
  @IsString()
  @IsOptional()
  academicTitleAttestat?: string;

  // Training and Development
  @ApiPropertyOptional({ example: 3, description: 'Number of internships completed' })
  @IsInt()
  @IsOptional()
  @Min(0)
  internshipsCount?: number;

  @ApiPropertyOptional({ example: 'Google 2019, Microsoft 2020', description: 'Internship details' })
  @IsString()
  @IsOptional()
  internshipsInfo?: string;

  @ApiPropertyOptional({ example: 5, description: 'Number of training courses completed' })
  @IsInt()
  @IsOptional()
  @Min(0)
  trainingCount?: number;

  @ApiPropertyOptional({ example: 'AWS Certification, Docker Training', description: 'Training details' })
  @IsString()
  @IsOptional()
  trainingInfo?: string;

  // Awards and Recognition
  @ApiPropertyOptional({ example: 'Best Research Paper 2021', description: 'Field-specific awards' })
  @IsString()
  @IsOptional()
  awardsField?: string;

  @ApiPropertyOptional({ example: 'State Award for Science 2022', description: 'State-level awards' })
  @IsString()
  @IsOptional()
  awardsState?: string;

  // Supervision
  @ApiPropertyOptional({ example: 5, description: 'Number of PhD students supervised' })
  @IsInt()
  @IsOptional()
  @Min(0)
  supervisedPhd?: number;

  @ApiPropertyOptional({ example: 2, description: 'Number of DSc students supervised' })
  @IsInt()
  @IsOptional()
  @Min(0)
  supervisedDsc?: number;

  // Conference and Seminar Participation
  @ApiPropertyOptional({ example: 10, description: 'National/republic conferences attended' })
  @IsInt()
  @IsOptional()
  @Min(0)
  conferencesRepublic?: number;

  @ApiPropertyOptional({ example: 5, description: 'International conferences attended' })
  @IsInt()
  @IsOptional()
  @Min(0)
  conferencesInternational?: number;

  @ApiPropertyOptional({ example: 8, description: 'National/republic seminars attended' })
  @IsInt()
  @IsOptional()
  @Min(0)
  seminarsRepublic?: number;

  @ApiPropertyOptional({ example: 3, description: 'International seminars attended' })
  @IsInt()
  @IsOptional()
  @Min(0)
  seminarsInternational?: number;

  // Projects
  @ApiPropertyOptional({ example: 2, description: 'Fundamental research projects' })
  @IsInt()
  @IsOptional()
  @Min(0)
  projectsFundamental?: number;

  @ApiPropertyOptional({ example: 3, description: 'Practical/applied projects' })
  @IsInt()
  @IsOptional()
  @Min(0)
  projectsPractical?: number;

  @ApiPropertyOptional({ example: 1, description: 'Youth-focused projects' })
  @IsInt()
  @IsOptional()
  @Min(0)
  projectsYouth?: number;

  @ApiPropertyOptional({ example: 2, description: 'Business collaboration projects' })
  @IsInt()
  @IsOptional()
  @Min(0)
  projectsBusiness?: number;

  @ApiPropertyOptional({ example: 1, description: 'Innovation projects' })
  @IsInt()
  @IsOptional()
  @Min(0)
  projectsInnovation?: number;

  @ApiPropertyOptional({ example: 4, description: 'Number of innovative ideas submitted' })
  @IsInt()
  @IsOptional()
  @Min(0)
  innovativeIdeasCount?: number;
}
