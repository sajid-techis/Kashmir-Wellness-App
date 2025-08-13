// File: kashmir-wellness-backend/src/appointments/dto/create-appointment.dto.ts

import { IsString, IsNotEmpty, IsMongoId, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'The ID of the provider (Doctor, Lab, etc.)' })
  @IsMongoId()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({ description: 'The model name of the provider (e.g., Doctor, Lab)', example: 'Doctor' })
  @IsString()
  @IsNotEmpty()
  providerModel: string;

  @ApiProperty({ description: 'The date of the appointment in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)', example: '2025-12-20T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiProperty({ description: 'The start time of the appointment slot in HH:mm format', example: '14:30' })
  @IsString()
  @IsNotEmpty()
  // Use a regular expression to ensure the time is in the correct format
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;
}