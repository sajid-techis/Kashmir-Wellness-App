import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Service, ServiceSchema, ProviderAvailability, ProviderAvailabilitySchema } from './availability.schema'; // <-- NEW IMPORT

@Schema({ _id: false })
class GeoPoint {
    @Prop({
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
    })
    type: string;

    @Prop({
        type: [Number],
        required: true,
        validate: [
            (val: number[]) => val.length === 2,
            'Coordinates array must contain two numbers (longitude, latitude).',
        ],
    })
    coordinates: number[];
}
const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);


export type HospitalDocument = Hospital & Document;

@Schema({ timestamps: true })
export class Hospital {
    @Prop({ required: true, trim: true, unique: true })
    name: string;

    @Prop({ required: true, trim: true })
    phoneNumber: string;

    @Prop({ required: true, unique: true, trim: true })
    email: string;

    @Prop({ required: true, trim: true })
    address: string;

    @Prop({ type: GeoPointSchema, required: true })
    location: GeoPoint;

    @Prop({ type: [String], default: [] })
    departments: string[];

    // <-- UPDATED: Define services as a sub-document array
    @Prop({ type: [ServiceSchema], default: [] })
    services: Service[];

    // <-- NEW: Availability schedule
    @Prop({ type: ProviderAvailabilitySchema, required: false })
    availability?: ProviderAvailability;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: 0, min: 0 })
    averageRating: number;

    @Prop({ default: 0, min: 0 })
    reviewCount: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
    userId: mongoose.Types.ObjectId;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);

HospitalSchema.index({ location: '2dsphere' });