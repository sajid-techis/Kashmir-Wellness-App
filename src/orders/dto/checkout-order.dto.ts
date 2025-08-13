import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutOrderDto {
  @IsMongoId() // Ensure it's a valid MongoDB ObjectId
  @IsNotEmpty()
  addressId: string;

  @IsOptional() // The prescription URL is optional
  @IsString()
  prescriptionUrl?: string;
}