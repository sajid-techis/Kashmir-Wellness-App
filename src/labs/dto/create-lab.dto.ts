// File: kashmir-wellness-backend/src/labs/dto/create-lab.dto.ts

import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, IsOptional, IsBoolean, IsArray, ValidateNested, ArrayNotEmpty } from 'class-validator'; // <-- Add ArrayNotEmpty
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { LabServiceDto, CreateLabAvailabilityDto } from './availability.dto';
import { GeoPointDto } from '../../common/dto/location.dto';

export class CreateLabDto {
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

    @ApiProperty({ type: GeoPointDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => GeoPointDto)
    location: GeoPointDto;
    
    // --- THIS IS THE FIX ---
    // Add the testsOffered property to allow it in the request body
    @ApiProperty({ type: [String], required: false, description: 'List of specific tests offered by the lab' })
    @IsArray()
    @IsString({ each: true }) // Validates that each item in the array is a string
    @IsOptional()
    testsOffered?: string[];
    // --- END FIX ---

    @ApiProperty({ required: false, type: [LabServiceDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LabServiceDto)
    services: LabServiceDto[] = [];

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean()
    isActive: boolean;

    @ApiProperty({ description: 'ID of the user who owns this lab profile' })
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ type: CreateLabAvailabilityDto, required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateLabAvailabilityDto)
    availability?: CreateLabAvailabilityDto;
}