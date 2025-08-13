// File: kashmir-wellness-backend/src/schemas/lab.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Service, ServiceSchema, ProviderAvailability, ProviderAvailabilitySchema } from './availability.schema'; // <-- NEW IMPORT

// Define the GeoJSON Point sub-schema
@Schema({ _id: false }) // Do not create an _id for this subdocument
class GeoPoint {
    @Prop({
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
    })
    type: string;

    // IMPORTANT: MongoDB stores coordinates as [longitude, latitude]
    @Prop({ type: [Number], required: true, validate: [(val: number[]) => val.length === 2, 'Coordinates array must contain two numbers (longitude, latitude).'] })
    coordinates: number[]; // [longitude, latitude]
}
const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);


export type LabDocument = Lab & Document;

@Schema({ timestamps: true })
export class Lab {
    @Prop({ required: true, trim: true, unique: true })
    name: string;

    @Prop({ required: true, trim: true })
    phoneNumber: string;

    @Prop({ required: true, unique: true, trim: true })
    email: string;

    @Prop({ required: true, trim: true })
    address: string; // A single string for the human-readable address

    // The GeoJSON location field for geospatial queries
    @Prop({ type: GeoPointSchema, required: true })
    location: GeoPoint;

    @Prop({ type: [ServiceSchema], default: [] })
    services: Service[];

    @Prop({ type: ProviderAvailabilitySchema, required: false })
    availability?: ProviderAvailability;

    @Prop({ default: true })
    isActive: boolean; // For admin to enable/disable the lab

    // Corrected userId field
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
    userId: mongoose.Types.ObjectId;
}

export const LabSchema = SchemaFactory.createForClass(Lab);

// Create the 2dsphere index on the location field
LabSchema.index({ location: '2dsphere' });