import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateScientificTaskDto {
  @IsString()
  @IsNotEmpty()
  taskName: string;

  @IsString()
  @IsOptional()
  taskDescription?: string;

  @IsDateString()
  @IsNotEmpty()
  deadline: string;
}
