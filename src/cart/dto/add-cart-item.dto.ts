// File: kashmir-wellness-backend/src/cart/dto/add-cart-item.dto.ts
import { IsMongoId, IsInt, Min, IsNotEmpty } from 'class-validator';

export class AddCartItemDto {
  @IsMongoId({ message: 'productId must be a valid MongoId' })
  @IsNotEmpty({ message: 'productId cannot be empty' })
  productId: string;

  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  @IsNotEmpty({ message: 'quantity cannot be empty' })
  quantity: number;
}