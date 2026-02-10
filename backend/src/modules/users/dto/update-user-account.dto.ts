import { IsString, IsOptional, IsDateString, IsInt, IsBoolean, Min, Max, IsEmail, Matches } from 'class-validator';

export class UpdateUserAccountDto {
  // Personal Information
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string; // male, female, other

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  countryOfBirth?: string;

  @IsString()
  @IsOptional()
  regionOfBirth?: string;

  @IsString()
  @IsOptional()
  currentAddress?: string;

  @IsString()
  @IsOptional()
  permanentAddress?: string;

  // Identification
  @IsString()
  @IsOptional()
  passportSerial?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{14}$/, { message: 'Personal ID must be exactly 14 digits' })
  personalId?: string;

  @IsString()
  @IsOptional()
  stirInn?: string;

  // Contact Information
  @IsEmail()
  @IsOptional()
  email1?: string;

  @IsEmail()
  @IsOptional()
  email2?: string;

  @IsString()
  @IsOptional()
  phone1?: string;

  @IsString()
  @IsOptional()
  phone2?: string;

  // Language Proficiency
  @IsString()
  @IsOptional()
  englishLevel?: string; // A1, A2, B1, B2, C1, C2

  // Profile Image
  @IsString()
  @IsOptional()
  profileImage?: string;

  // Educational Background - Bachelor
  @IsString()
  @IsOptional()
  bachelorUniversity?: string;

  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  bachelorYear?: number;

  @IsString()
  @IsOptional()
  bachelorDirection?: string;

  @IsString()
  @IsOptional()
  bachelorDiplomaNumber?: string;

  // Educational Background - Master
  @IsString()
  @IsOptional()
  masterUniversity?: string;

  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  masterYear?: number;

  @IsString()
  @IsOptional()
  masterDirection?: string;

  @IsString()
  @IsOptional()
  masterDiplomaNumber?: string;

  // Research
  @IsString()
  @IsOptional()
  researchArea?: string;

  // PhD Information
  @IsBoolean()
  @IsOptional()
  hasPhdDegree?: boolean;

  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  phdYear?: number;

  @IsString()
  @IsOptional()
  phdSpeciality?: string;

  @IsString()
  @IsOptional()
  phdTopic?: string;

  @IsString()
  @IsOptional()
  phdDiplomaNumber?: string;

  @IsString()
  @IsOptional()
  phdCountry?: string;

  @IsString()
  @IsOptional()
  phdOrganization?: string;

  // DSc Information
  @IsBoolean()
  @IsOptional()
  hasDscDegree?: boolean;

  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  dscYear?: number;

  @IsString()
  @IsOptional()
  dscSpeciality?: string;

  @IsString()
  @IsOptional()
  dscTopic?: string;

  @IsString()
  @IsOptional()
  dscDiplomaNumber?: string;

  @IsString()
  @IsOptional()
  dscCountry?: string;

  @IsString()
  @IsOptional()
  dscOrganization?: string;

  // Academic Title
  @IsBoolean()
  @IsOptional()
  hasAcademicTitle?: boolean;

  @IsString()
  @IsOptional()
  academicTitleName?: string;

  @IsString()
  @IsOptional()
  academicTitleSpeciality?: string;

  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear())
  academicTitleYear?: number;

  @IsString()
  @IsOptional()
  academicTitleAttestat?: string;

  // Training and Development
  @IsInt()
  @IsOptional()
  @Min(0)
  internshipsCount?: number;

  @IsString()
  @IsOptional()
  internshipsInfo?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  trainingCount?: number;

  @IsString()
  @IsOptional()
  trainingInfo?: string;

  // Awards and Recognition
  @IsString()
  @IsOptional()
  awardsField?: string;

  @IsString()
  @IsOptional()
  awardsState?: string;

  // Supervision
  @IsInt()
  @IsOptional()
  @Min(0)
  supervisedPhd?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  supervisedDsc?: number;

  // Conference and Seminar Participation
  @IsInt()
  @IsOptional()
  @Min(0)
  conferencesRepublic?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  conferencesInternational?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  seminarsRepublic?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  seminarsInternational?: number;

  // Projects
  @IsInt()
  @IsOptional()
  @Min(0)
  projectsFundamental?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  projectsPractical?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  projectsYouth?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  projectsBusiness?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  projectsInnovation?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  innovativeIdeasCount?: number;
}
