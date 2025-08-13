import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // Import MongooseModule
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';

// Import the provider schemas
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';
import { Lab, LabSchema } from '../schemas/lab.schema';
import { Hospital, HospitalSchema } from '../schemas/hospital.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: Lab.name, schema: LabSchema },
      { name: Hospital.name, schema: HospitalSchema },
    ]),
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}