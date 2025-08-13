// File: kashmir-wellness-backend/src/labs/dto/update-lab.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreateLabDto } from './create-lab.dto';

export class UpdateLabDto extends PartialType(CreateLabDto) {}