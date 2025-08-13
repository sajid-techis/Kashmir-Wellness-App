// File: kashmir-wellness-backend/src/auth/dto/register.dto.ts

import { IsEmail, IsString, MinLength, IsOptional, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(13, { message: 'Phone number cannot exceed 13 characters' })
    phoneNumber?: string;
}