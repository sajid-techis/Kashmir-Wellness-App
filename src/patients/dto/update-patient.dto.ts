import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';

// PartialType makes all properties of CreatePatientDto optional
export class UpdatePatientDto extends PartialType(CreatePatientDto) {}