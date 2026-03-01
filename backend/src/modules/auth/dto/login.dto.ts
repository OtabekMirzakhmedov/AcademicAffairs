import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'User login/username' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'admin123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: false, description: 'Remember me for extended session (30 days)' })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
