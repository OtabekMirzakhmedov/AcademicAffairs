import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  headId?: number;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;
}
