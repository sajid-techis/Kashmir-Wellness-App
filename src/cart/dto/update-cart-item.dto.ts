// File: kashmir-wellness-backend/src/cart/dto/update-cart-item.dto.ts
import { IsInt, Min, IsNotEmpty } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  @IsNotEmpty({ message: 'quantity cannot be empty' })
  quantity: number;
}