// File: kashmir-wellness-backend/src/schemas/appointment.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Doctor } from './doctor.schema';
import { Lab } from './lab.schema';
import { Hospital } from './hospital.schema';
import { User } from './user.schema';

export enum AppointmentStatus {
  Booked = 'booked',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Rescheduled = 'rescheduled',
  Pending = 'pending',
}

export enum AppointmentType {
  DoctorOnline = 'doctor-online',
  DoctorOffline = 'doctor-offline',
  Lab = 'lab',
  Hospital = 'hospital',
}

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  // The polymorphic reference to the service provider
  @Prop({ type: Types.ObjectId, required: true, refPath: 'providerModel' })
  providerId: Types.ObjectId;

  // The model name (Doctor, Lab, or Hospital) that providerId refers to
  @Prop({
    type: String,
    required: true,
    enum: [Doctor.name, Lab.name, Hospital.name],
  })
  providerModel: string;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ required: true })
  appointmentTime: string; // e.g., "10:30" (or you could use Date objects)

  @Prop({ required: true, enum: Object.values(AppointmentType) })
  appointmentType: AppointmentType;

  @Prop({ required: true, enum: Object.values(AppointmentStatus), default: AppointmentStatus.Pending })
  status: AppointmentStatus;

  @Prop({ required: false })
  notes?: string;

  @Prop({ type: Number, required: true, min: 0 })
  fee: number;

  @Prop({ default: false })
  isPaid: boolean;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Add an index to find appointments quickly by user and date
AppointmentSchema.index({ userId: 1, appointmentDate: 1 });