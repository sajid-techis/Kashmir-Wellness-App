import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ProviderType {
  Doctor = 'Doctor',
  Lab = 'Lab',
  Hospital = 'Hospital'
}

export class ProviderFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsEnum(ProviderType)
  type?: ProviderType;

  // Handles comma-separated values from the query string
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  departments?: string[];
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  testsOffered?: string[];
}