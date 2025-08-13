import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

// Import all necessary schemas for polymorphic referencing
import { Appointment, AppointmentSchema } from '../schemas/appointment.schema';
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';
import { Lab, LabSchema } from '../schemas/lab.schema';
import { Hospital, HospitalSchema } from '../schemas/hospital.schema';
import { User, UserSchema } from '../schemas/user.schema'; // <-- NEW: User schema for population
import { DoctorsModule } from '../doctors/doctors.module';
import { LabsModule } from '../labs/labs.module';
import { HospitalsModule } from '../hospitals/hospitals.module'; // Import HospitalsModule if needed

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Lab.name, schema: LabSchema },
      { name: Hospital.name, schema: HospitalSchema },
      { name: User.name, schema: UserSchema }, // <-- NEW: Register User schema
    ]),
    DoctorsModule, // Import DoctorsModule to access DoctorService if needed
    LabsModule, // Import LabsModule to access LabService if needed
    HospitalsModule, // Import HospitalsModule to access HospitalService if needed
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}