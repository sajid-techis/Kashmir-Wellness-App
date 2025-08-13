// File: kashmir-wellness-backend/src/schemas/address.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema'; // Import User schema (for ref)

export type AddressDocument = Address & Document;

@Schema({ timestamps: true })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId; // User who owns this address

  @Prop({ required: true, trim: true })
  addressLine1: string; // <-- Ensure this is 'addressLine1', not 'street'

  @Prop({ required: false, trim: true }) // Optional
  addressLine2?: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ required: true, trim: true })
  postalCode: string; // <-- Ensure this is 'postalCode', not 'zipCode'

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ required: false, trim: true }) // Make sure this is 'required: false'
  phoneNumber?: string; // Contact for delivery at this address

  @Prop({ default: false }) // To mark a default shipping address
  isDefault: boolean;

  @Prop({ trim: true, default: 'Home' }) // e.g., Home, Work, Other
  type: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);