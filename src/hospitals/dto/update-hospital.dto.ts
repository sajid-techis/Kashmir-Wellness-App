// File: kashmir-wellness-backend/src/hospitals/dto/update-hospital.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreateHospitalDto } from './create-hospital.dto';

export class UpdateHospitalDto extends PartialType(CreateHospitalDto) {}