// File: kashmir-wellness-backend/src/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../common/enums/role.enum';

// --- NEW: Sub-schema for the provider profile link ---
@Schema({ _id: false })
class ProviderProfile {
  @Prop({ type: Types.ObjectId, required: true, refPath: 'providerProfile.providerModel' })
  providerId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['Doctor', 'Lab', 'Hospital'] })
  providerModel: string;
}
const ProviderProfileSchema = SchemaFactory.createForClass(ProviderProfile);
// --- END: New Sub-schema ---


export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ required: true, enum: Object.values(Role), default: Role.User })
  role: Role;

  @Prop({ required: false, trim: true })
  firstName?: string;

  @Prop({ required: false, trim: true })
  lastName?: string;

  @Prop({ required: false, trim: true, default: null })
  phoneNumber?: string;
  
  // --- NEW: Add the providerProfile field ---
  @Prop({ type: ProviderProfileSchema, required: false, default: null })
  providerProfile?: ProviderProfile;
}

export const UserSchema = SchemaFactory.createForClass(User);