// File: kashmir-wellness-backend/src/common/dto/location.dto.ts

import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ArrayMaxSize, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// This is our new, reusable DTO for GeoJSON points.
export class GeoPointDto {
    @ApiProperty({ example: 'Point', description: 'The GeoJSON type.', enum: ['Point'] })
    @IsString()
    @IsNotEmpty()
    @IsIn(['Point'])
    type: 'Point';

    @ApiProperty({ example: [74.7973, 34.0837], description: 'Coordinates as [longitude, latitude]' })
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsNumber({}, { each: true })
    @Min(-180, { each: true })
    @Max(180, { each: true })
    coordinates: [number, number]; // [longitude, latitude]
}