// File: kashmir-wellness-backend/src/hospitals/dto/create-hospital.dto.ts

import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { HospitalServiceDto, CreateHospitalAvailabilityDto } from './availability.dto';
import { GeoPointDto } from '../../common/dto/location.dto'; // <-- NEW: Import the shared DTO

// The old internal GeoPointDto class has been REMOVED from this file.

export class CreateHospitalDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsPhoneNumber('IN')
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ type: GeoPointDto }) // <-- Use the imported DTO
    @IsNotEmpty()
    @ValidateNested() // <-- Add ValidateNested for the sub-DTO
    @Type(() => GeoPointDto)
    location: GeoPointDto;

    // ... rest of the file remains the same
    @ApiProperty({ required: false, type: [HospitalServiceDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HospitalServiceDto)
    services: HospitalServiceDto[] = [];

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean()
    isActive: boolean;

    @ApiProperty({ description: 'The ID of the user linked to this hospital profile' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ type: CreateHospitalAvailabilityDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateHospitalAvailabilityDto)
    availability?: CreateHospitalAvailabilityDto;
}