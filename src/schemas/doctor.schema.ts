// File: kashmir-wellness-backend/src/schemas/doctor.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './user.schema';
import * as mongoose from 'mongoose';
// --- IMPORT ServiceSchema ---
import { ProviderAvailability, ProviderAvailabilitySchema, Service, ServiceSchema } from './availability.schema';

@Schema({ _id: false })
class ClinicAddress {
  @Prop({ required: true, trim: true })
  addressLine1: string;

  @Prop({ required: false, trim: true })
  addressLine2?: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ required: true, trim: true })
  postalCode: string;

  @Prop({ required: true, trim: true })
  country: string;
}
const ClinicAddressSchema = SchemaFactory.createForClass(ClinicAddress);

export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true })
export class Doctor {
  // ... (all other properties like name, email, etc. remain the same)
  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ required: true, trim: true })
  qualification: string;

  @Prop({ required: true, trim: true, index: true })
  specialization: string;

  @Prop({ required: false, trim: true })
  experienceYears?: number;

  @Prop({ required: true, unique: true, trim: true })
  registrationNumber: string;

  @Prop({ required: false, trim: true })
  bio?: string;

  @Prop({ type: Number, required: true, min: 0 })
  consultationFee: number;

  @Prop({ type: ClinicAddressSchema, required: false })
  clinicAddress?: ClinicAddress;
  
  // --- ADDED SERVICES PROPERTY ---
  @Prop({ type: [ServiceSchema], default: [] })
  services: Service[];

  @Prop({ type: ProviderAvailabilitySchema, required: false })
  availability?: ProviderAvailability;

  @Prop({ default: false })
  isOnlineConsultationAvailable: boolean;

  @Prop({ required: false, trim: true })
  onlineConsultationPlatform?: string;

  @Prop({ required: false, trim: true })
  onlineConsultationLink?: string;

  @Prop({ required: false, trim: true })
  profileImageUrl?: string;

  @Prop({ default: 0, min: 0 })
  averageRating: number;

  @Prop({ default: 0, min: 0 })
  reviewCount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: mongoose.Types.ObjectId;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

DoctorSchema.index({ specialization: 1, 'clinicAddress.city': 1 });
DoctorSchema.index({ name: 'text', specialization: 'text' });