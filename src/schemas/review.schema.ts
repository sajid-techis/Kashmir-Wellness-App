import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema'; // Import User schema (for ref)
import { Product } from './product.schema'; // Import Product schema (for ref - will be updated later)

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId; // User who submitted the review

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId; // Product being reviewed

  @Prop({ required: true, min: 1, max: 5 })
  rating: number; // Star rating (1-5)

  @Prop({ required: false, trim: true })
  comment?: string; // Optional text review

  // Optional: helpfulness counter, replies, etc. can be added later
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Add a compound unique index: A user can only leave one review per product
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });