import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsMongoId } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId({ message: 'productId must be a valid MongoDB ID' })
  productId: string; // The ID of the product being reviewed

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number; // Star rating (1-5)

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Comment cannot be empty if provided' })
  comment?: string;
  // userId will come from req.user, not from the body
}