import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateScientificTaskDto {
  @IsString()
  @IsOptional()
  taskName?: string;

  @IsString()
  @IsOptional()
  taskDescription?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
