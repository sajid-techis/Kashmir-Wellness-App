// File: kashmir-wellness-backend/src/orders/dto/update-order.dto.ts
import { IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from '../../schemas/order.schema'; // Import the OrderStatus enum

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Invalid order status provided' })
  status?: OrderStatus;

  // Add other optional fields here if you want to allow updating them
}