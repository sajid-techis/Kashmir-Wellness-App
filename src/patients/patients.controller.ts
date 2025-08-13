import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException, // Import NotFoundException
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients') // Base route for all patient-related endpoints
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // Set HTTP status code to 201 Created
  async create(@Body() createPatientDto: CreatePatientDto) {
    // @Body() automatically extracts the request body and validates it against CreatePatientDto
    return await this.patientsService.create(createPatientDto);
  }

  @Get()
  async findAll() {
    return await this.patientsService.findAll();
  }

  @Get(':id') // Route parameter for patient ID
  async findOne(@Param('id') id: string) {
    // @Param('id') extracts the 'id' from the URL
    const patient = await this.patientsService.findOneById(id);
    if (!patient) {
      throw new NotFoundException(`Patient with ID "${id}" not found.`);
    }
    return patient;
  }

  @Patch(':id') // Route parameter for patient ID for partial updates
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto, // Use UpdatePatientDto
  ) {
    const updatedPatient = await this.patientsService.update(id, updatePatientDto);
    if (!updatedPatient) {
      throw new NotFoundException(`Patient with ID "${id}" not found or no changes made.`);
    }
    return updatedPatient;
  }

  @Delete(':id') // Route parameter for patient ID for deletion
  @HttpCode(HttpStatus.NO_CONTENT) // Set HTTP status code to 204 No Content
  async remove(@Param('id') id: string) {
    const deletedPatient = await this.patientsService.remove(id);
    if (!deletedPatient) {
      throw new NotFoundException(`Patient with ID "${id}" not found.`);
    }
    // No content is returned for 204 status
  }
}