import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsOptional, IsMongoId } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsOptional() // productId and rating/comment can be optional for updates
  @IsMongoId({ message: 'productId must be a valid MongoDB ID' })
  productId?: string; // Product ID is not typically updated in a review, but included for PartialType
}