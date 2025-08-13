import { IsString, IsEmail, IsOptional, IsDate, IsArray, IsDateString } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString() // Use IsDateString for string inputs that represent dates (e.g., '2000-01-01')
  dateOfBirth?: string; // Or Date if you prefer to receive as Date object and transform

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Validate each item in the array as a string
  medicalHistory?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentMedications?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}