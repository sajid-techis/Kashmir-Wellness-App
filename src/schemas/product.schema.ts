import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  // New fields for advanced inventory management
  @Prop({ required: true, trim: true })
  batchNumber: string;

  @Prop({ required: true, type: Date })
  expiryDate: Date;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number; // Current inventory level

  @Prop({ type: [String], default: [] }) // Array of image URLs
  images: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  categoryIds: Types.ObjectId[];

  @Prop({ type: [String], default: [] }) // Tags for search and filtering
  tags: string[];

  @Prop({ type: Object, default: {} }) // Flexible field for additional properties
  attributes: Record<string, any>;

  @Prop({ default: true }) // Is the product visible/active?
  isActive: boolean;

  @Prop({ default: 0, min: 0 }) // Average rating
  averageRating: number;

  @Prop({ default: 0, min: 0 }) // Number of reviews
  reviewCount: number;

  @Prop({ default: false })
  requiresPrescription: boolean;

}

export const ProductSchema = SchemaFactory.createForClass(Product);