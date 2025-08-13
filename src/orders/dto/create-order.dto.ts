import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  Min,
  IsMongoId,
  IsOptional // <-- ADDED IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsNotEmpty({ each: true })
  items: CreateOrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  // NEW: Optional URL for the uploaded prescription
  @IsOptional()
  @IsString()
  prescriptionUrl?: string; // <-- ADDED
}