import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateResearchActivityDto {
  @IsInt()
  templateId: number;

  @IsOptional()
  @IsString()
  deadline?: string;
}
