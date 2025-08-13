import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, IsNumber, Min, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAvailabilityDto, ServiceDto } from '../../providers/dto/availability.dto';

export class ClinicAddressDto {
  @ApiProperty() @IsString() @IsNotEmpty() addressLine1: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() addressLine2?: string;
  @ApiProperty() @IsString() @IsNotEmpty() city: string;
  @ApiProperty() @IsString() @IsNotEmpty() state: string;
  @ApiProperty() @IsString() @IsNotEmpty() postalCode: string;
  @ApiProperty() @IsString() @IsNotEmpty() country: string;
}

export class CreateDoctorDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsEmail() @IsNotEmpty() email: string;
  @ApiProperty() @IsPhoneNumber('IN') @IsNotEmpty() phoneNumber: string;
  @ApiProperty() @IsString() @IsNotEmpty() qualification: string;
  @ApiProperty() @IsString() @IsNotEmpty() specialization: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) experienceYears?: number;
  @ApiProperty() @IsString() @IsNotEmpty() registrationNumber: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bio?: string;
  @ApiProperty() @IsNumber() @Min(0) consultationFee: number;
  @ApiProperty({ type: ClinicAddressDto, required: false }) @IsOptional() @Type(() => ClinicAddressDto) @ValidateNested() clinicAddress?: ClinicAddressDto;
  @ApiProperty({ type: [ServiceDto], required: false }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ServiceDto) services?: ServiceDto[];
  @ApiProperty({ type: CreateAvailabilityDto, required: false }) @IsOptional() @ValidateNested() @Type(() => CreateAvailabilityDto) availability?: CreateAvailabilityDto;
  @ApiProperty({ required: false, default: false }) @IsOptional() @IsBoolean() isOnlineConsultationAvailable?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() onlineConsultationPlatform?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() onlineConsultationLink?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() profileImageUrl?: string;
  @ApiProperty({ required: false, default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiProperty({ description: "The ID of the user this doctor profile is linked to."}) @IsString() @IsNotEmpty() userId: string;
}