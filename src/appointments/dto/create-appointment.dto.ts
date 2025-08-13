// File: kashmir-wellness-backend/src/appointments/dto/create-appointment.dto.ts

import { IsNotEmpty, IsMongoId, IsDateString, IsString, IsIn, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentType } from '../../schemas/appointment.schema';

export class CreateAppointmentDto {
    @ApiProperty({ description: 'The ID of the service provider (Doctor, Lab, or Hospital).' })
    @IsMongoId()
    @IsNotEmpty()
    providerId: string;

    @ApiProperty({ description: 'The model name of the provider: "Doctor", "Lab", or "Hospital".' })
    @IsString()
    @IsNotEmpty()
    providerModel: string;

    @ApiProperty({ description: 'The date of the appointment (ISO 8601 format, e.g., "YYYY-MM-DD").' })
    @IsDateString()
    @IsNotEmpty()
    appointmentDate: string;

    @ApiProperty({ description: 'The time of the appointment (e.g., "10:30").' })
    @IsString()
    @IsNotEmpty()
    appointmentTime: string;

    @ApiProperty({ description: 'The type of appointment being booked.' })
    @IsString()
    @IsNotEmpty()
    @IsIn([
        AppointmentType.DoctorOnline,
        AppointmentType.DoctorOffline,
        AppointmentType.Lab,
        AppointmentType.Hospital,
    ])
    appointmentType: AppointmentType;

    @ApiProperty({ description: 'The name of the service being booked, e.g., "Cardiology" or "Blood Test".' })
    @IsString()
    @IsNotEmpty()
    serviceName: string; // <-- NEW FIELD

    @ApiProperty({ description: 'Any additional notes for the appointment.', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}