// File: kashmir-wellness-backend/src/schemas/cart.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from './product.schema'; // Assuming you have a Product schema

export type CartDocument = Cart & Document;

// Sub-schema for an item within the cart
@Schema({ _id: false }) // Do not create a separate _id for subdocuments unless explicitly needed
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string; // Denormalized product name for easier display

  @Prop({ required: true })
  price: number; // Current price of the product when added or last updated in cart

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ default: null })
  imageUrl?: string; // Denormalized image for easier display
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);


@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields automatically
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId; // Each user has one cart

  @Prop({ type: [CartItemSchema], default: [] }) // Array of CartItem subdocuments
  items: CartItem[];

  @Prop({ required: true, default: 0 })
  totalAmount: number; // Calculated total of all items in the cart
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Add a pre-save hook to calculate totalAmount before saving
CartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  next();
});

// Add a pre-findOneAndUpdate hook for update operations
CartSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as Cart; // Get the update object
  if (update && update.items) { // Check if items are being updated
    update.totalAmount = update.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
  next();
});