// File: kashmir-wellness-backend/src/schemas/availability.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose'; // <-- REMOVED Types import

@Schema({ _id: false })
export class AvailabilitySlot {
  @Prop({ required: true })
  dayOfWeek: string;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;
}
export const AvailabilitySlotSchema = SchemaFactory.createForClass(AvailabilitySlot);


@Schema({ _id: false })
export class Service {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;
}
export const ServiceSchema = SchemaFactory.createForClass(Service);


@Schema({ timestamps: true }) // Changed from _id: false to allow for potential standalone use
export class ProviderAvailability {
  @Prop({ required: true, type: [AvailabilitySlotSchema] })
  slots: AvailabilitySlot[];

  @Prop({ required: true, min: 1, default: 30 })
  slotDurationMinutes: number;

  // --- THIS IS THE FIX ---
  // Change the type from [Types.ObjectId] to [Date]
  @Prop({ type: [Date], default: [] })
  unavailableDates: Date[]; // To block specific dates
}

export type ProviderAvailabilityDocument = ProviderAvailability & Document;
export const ProviderAvailabilitySchema = SchemaFactory.createForClass(ProviderAvailability);