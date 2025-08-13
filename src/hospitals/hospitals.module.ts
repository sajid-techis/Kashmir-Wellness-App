// File: kashmir-wellness-backend/src/hospitals/hospitals.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HospitalsService } from './hospitals.service';
import { HospitalsController } from './hospitals.controller';
import { Hospital, HospitalSchema } from '../schemas/hospital.schema';
import { User, UserSchema } from '../schemas/user.schema'; // <-- NEW: Import User schema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hospital.name, schema: HospitalSchema },
      { name: User.name, schema: UserSchema }, // <-- NEW: Register User schema
    ]),
  ],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService],
})
export class HospitalsModule {}