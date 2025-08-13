import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { MongooseModule } from '@nestjs/mongoose'; // Import MongooseModule
import { Patient, PatientSchema } from '../schemas/patient.schema'; // Import Patient model and schema

@Module({
  imports: [
    // Register the Patient schema with MongooseModule for this feature module
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService], // Export PatientsService if other modules might need to inject it
})
export class PatientsModule {}