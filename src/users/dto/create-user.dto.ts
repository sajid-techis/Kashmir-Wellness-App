import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsEmpty, IsNotEmpty, Max, MaxLength, IsPhoneNumber, max } from 'class-validator';
import { Role } from '../../common/enums/role.enum'; // Import the Role enum

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password cannot exceed 64 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string; // This DTO expects the PLAIN password

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber("IN", { message: 'Invalid phone number format' })
  @MaxLength(13, { message: 'Phone number cannot exceed 13 characters' })
  phoneNumber?: string; // Optional, but can be used for contact purposes

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role provided' })
  role?: Role; // This allows an admin to set a role when creating a user
}