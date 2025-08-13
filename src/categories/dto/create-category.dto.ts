import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string; // Optional, will be auto-generated if not provided

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  parentCategory?: string; // MongoDB ObjectId string
}