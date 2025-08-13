import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: false, unique: true, trim: true, lowercase: true })
  slug: string; // URL-friendly version of the name

  @Prop({ required: false })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  parentCategory?: Types.ObjectId; // For nested categories
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Add a pre-save hook to generate slug if not provided
CategorySchema.pre<CategoryDocument>('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
  }
  next();
});