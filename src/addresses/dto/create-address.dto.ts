// File: kashmir-wellness-backend/src/addresses/dto/create-address.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsPhoneNumber, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsPhoneNumber('IN', { message: 'Invalid phone number format for India' })
  @MaxLength(15)
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  type?: string;
}