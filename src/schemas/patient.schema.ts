import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  address?: string; // Consider if this should be a reference to Address schema instead for consistency

  @Prop({ required: false })
  dateOfBirth?: Date;

  @Prop({ required: false })
  gender?: string;

  @Prop({ type: [String], default: [] })
  medicalHistory: string[];

  @Prop({ type: [String], default: [] })
  currentMedications: string[];

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ required: false })
  notes?: string;

  // Link to the User account if this patient is also a logged-in user
  // `unique: true` means one user can only be linked to one patient profile.
  // `sparse: true` allows multiple documents to have a null userId, so patients without user accounts are fine.
  @Prop({ type: Types.ObjectId, ref: 'User', unique: true, sparse: true, default: null })
  userId?: Types.ObjectId;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);