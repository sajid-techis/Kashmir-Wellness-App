import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Product } from './product.schema';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  FAILED = 'failed',
}

// NEW: Enum for prescription status
export enum PrescriptionStatus {
  AWAITING_REVIEW = 'awaiting_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false })
  imageUrl?: string;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class OrderShippingAddress {
  @Prop({ required: true })
  addressLine1: string;

  @Prop({ required: false })
  addressLine2?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: false })
  phoneNumber?: string;
}
export const OrderShippingAddressSchema = SchemaFactory.createForClass(OrderShippingAddress);

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
    required: true,
  })
  status: OrderStatus;

  @Prop({ type: OrderShippingAddressSchema, required: true })
  shippingAddress: OrderShippingAddress;

  @Prop({ default: null })
  paymentId?: string;

  // NEW: Fields for prescription handling
  @Prop({ default: false })
  isPrescriptionRequired: boolean; // <-- ADDED: Was a prescription required for this order?

  @Prop({ required: false })
  prescriptionUrl?: string; // <-- ADDED: URL to the uploaded prescription file

  @Prop({
    type: String,
    enum: Object.values(PrescriptionStatus),
    default: PrescriptionStatus.AWAITING_REVIEW, // <-- ADDED: Initial status
    required: true,
  })
  prescriptionStatus: PrescriptionStatus; // <-- ADDED: Status of the prescription review

}

export const OrderSchema = SchemaFactory.createForClass(Order);