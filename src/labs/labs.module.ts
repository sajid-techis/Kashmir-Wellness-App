// File: kashmir-wellness-backend/src/labs/labs.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LabsService } from './labs.service';
import { LabsController } from './labs.controller';
import { Lab, LabSchema } from '../schemas/lab.schema';
import { User, UserSchema } from '../schemas/user.schema'; // <-- NEW: Import User schema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lab.name, schema: LabSchema },
      { name: User.name, schema: UserSchema }, // <-- NEW: Register User schema
    ]),
  ],
  controllers: [LabsController],
  providers: [LabsService],
  exports: [LabsService],
})
export class LabsModule {}