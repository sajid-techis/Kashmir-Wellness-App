import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  IsMongoId,
  IsObject,
  IsNotEmpty,
  IsDateString // <-- NEW IMPORT
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
  
  // New fields for advanced inventory management
  @IsString()
  @IsNotEmpty()
  batchNumber: string;
  
  @IsDateString() // Validates a date string like '2025-12-31'
  @IsNotEmpty()
  expiryDate: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // Array of image URLs

  @IsOptional()
  @IsMongoId({ each: true }) // Validate if each ID is a valid MongoDB ObjectId
  categoryIds?: string[]; // Will be the category IDs as strings

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  @Type(() => Object) // Ensures it's treated as an object for validation
  attributes?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}