import {
    IsString,
    IsNotEmpty,
    IsNumber,
    Min,
    IsArray,
    ValidateNested,
    IsOptional,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotDto {
    @ApiProperty({ example: 'Monday', description: 'Day of the week' })
    @IsString()
    @IsNotEmpty()
    dayOfWeek: string;

    @ApiProperty({ example: '09:00', description: 'Start time in 24-hour format (HH:mm)' })
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ example: '17:00', description: 'End time in 24-hour format (HH:mm)' })
    @IsString()
    @IsNotEmpty()
    endTime: string;
}

export class CreateAvailabilityDto {
    @ApiProperty({ type: [AvailabilitySlotDto], description: 'Array of availability slots per day' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AvailabilitySlotDto)
    slots: AvailabilitySlotDto[];

    @ApiProperty({ example: 30, description: 'Duration of each appointment slot in minutes' })
    @IsNumber()
    @Min(1)
    slotDurationMinutes: number;

    @ApiProperty({
        example: ['2025-12-25'],
        description: 'Array of dates where the provider is unavailable (YYYY-MM-DD format)',
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsDateString({}, { each: true }) // <-- CORRECTED: The { each: true } option belongs here
    unavailableDates?: string[];
}