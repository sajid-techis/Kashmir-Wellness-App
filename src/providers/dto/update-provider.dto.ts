import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEmail, IsPhoneNumber, IsArray } from 'class-validator';

export class UpdateProviderDto {
  @ApiPropertyOptional({ example: 'Dr. John Doe', description: 'The name of the provider.' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'The email address of the provider.' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'The phone number of the provider.' })
  @IsOptional()
  @IsPhoneNumber('IN')
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Experienced cardiologist with 15 years of practice.', description: 'A short biography of the provider.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 1500, description: 'The consultation fee for the provider.' })
  @IsOptional()
  @IsInt()
  consultationFee?: number;
  
  // Example for a doctor
  @ApiPropertyOptional({ example: 'MBBS, MD', description: 'The qualifications of a doctor.' })
  @IsOptional()
  @IsString()
  qualification?: string;

  // Example for a lab
  @ApiPropertyOptional({ example: ['Blood Test', 'MRI Scan'], description: 'Tests offered by a lab.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testsOffered?: string[];

  // Example for a hospital
  @ApiPropertyOptional({ example: ['Cardiology', 'Neurology'], description: 'Departments available in a hospital.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departments?: string[];
}