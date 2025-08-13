import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    UnauthorizedException, forwardRef, Inject
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

import { Order, OrderDocument, OrderItem, OrderStatus, PrescriptionStatus } from '../schemas/order.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Address, AddressDocument } from '../schemas/address.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Role } from '../common/enums/role.enum';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';

import { CartService } from '../cart/cart.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private cartService: CartService,
        @Inject(forwardRef(() => PaymentsService)) private paymentsService: PaymentsService,
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async create(createOrderDto: CreateOrderDto, userId: Types.ObjectId): Promise<OrderDocument> {
        const orderItems: OrderItem[] = [];
        let totalAmount = 0;

        console.log(`OrdersService - create: Starting order creation for user ${userId.toString()}`);

        for (const itemDto of createOrderDto.items) {
            console.log(`OrdersService - create: Fetching product ${itemDto.productId}`);
            const product = await this.productModel.findById(itemDto.productId).exec();

            if (!product) {
                console.error(`OrdersService - create: Product with ID "${itemDto.productId}" not found.`);
                throw new NotFoundException(`Product with ID "${itemDto.productId}" not found.`);
            }
            orderItems.push({
                productId: new Types.ObjectId(itemDto.productId),
                name: product.name,
                quantity: itemDto.quantity,
                price: product.price,
                imageUrl: product.images[0]
            });
            totalAmount += product.price * itemDto.quantity;
        }

        const newOrder = new this.orderModel({
            userId: userId,
            items: orderItems,
            totalAmount: totalAmount,
            shippingAddress: createOrderDto.shippingAddress,
            status: OrderStatus.PENDING,
        });

        try {
            const savedOrder = await newOrder.save();
            console.log(`OrdersService - create: Order saved successfully with ID: ${(savedOrder._id as Types.ObjectId).toString()} for user ${(savedOrder.userId as Types.ObjectId).toString()}`);
            return savedOrder;
        } catch (error) {
            console.error('OrdersService - create: Error creating order:', error);
            throw new InternalServerErrorException('Failed to create order.');
        }
    }

    async createOrderFromCart(userId: Types.ObjectId, checkoutOrderDto: CheckoutOrderDto, prescriptionUrl?: string): Promise<OrderDocument> {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            console.log(`OrdersService - createOrderFromCart: Starting checkout for user ${userId.toString()}`);

            const cart = await this.cartService.getCart(userId.toString());
            if (!cart || cart.items.length === 0) {
                throw new BadRequestException('Your cart is empty. Please add items before checking out.');
            }

            const shippingAddress = await this.addressModel.findById(checkoutOrderDto.addressId).session(session).exec();
            if (!shippingAddress || !shippingAddress.userId.equals(userId)) {
                throw new NotFoundException('Shipping address not found or does not belong to the user.');
            }

            const orderItems: OrderItem[] = [];
            let totalAmount = 0;

            let isPrescriptionRequired = false;
            const productsInCartIds = cart.items.map(item => item.productId);
            const productsInCart = await this.productModel.find({ _id: { $in: productsInCartIds } }).session(session).exec();

            let product: ProductDocument | undefined;
            for (const cartItem of cart.items) {
                for (const p of productsInCart) {
                    if ((p as any)._id.toString() === cartItem.productId.toString()) {
                        product = p;
                        break;
                    }
                }

                if (!product) {
                    throw new NotFoundException(`Product "${cartItem.name}" (ID: ${cartItem.productId}) not found.`);
                }

                if (product.stock < cartItem.quantity) {
                    throw new BadRequestException(`Not enough stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}.`);
                }

                if (product.requiresPrescription) {
                    isPrescriptionRequired = true;
                }

                orderItems.push({
                    productId: cartItem.productId,
                    name: product.name,
                    price: product.price,
                    quantity: cartItem.quantity,
                    imageUrl: product.images[0]
                });
                totalAmount += product.price * cartItem.quantity;
            }

            if (isPrescriptionRequired && !prescriptionUrl) {
                throw new BadRequestException('This order contains prescription-only medicine. A prescription URL is required.');
            }

            const newOrder = new this.orderModel({
                userId: userId,
                items: orderItems,
                totalAmount: totalAmount,
                shippingAddress: {
                    addressLine1: (shippingAddress as any).addressLine1,
                    city: (shippingAddress as any).city,
                    state: (shippingAddress as any).state,
                    postalCode: (shippingAddress as any).postalCode,
                    country: (shippingAddress as any).country,
                },
                isPrescriptionRequired: isPrescriptionRequired,
                prescriptionUrl: isPrescriptionRequired ? prescriptionUrl : undefined,
                prescriptionStatus: isPrescriptionRequired ? PrescriptionStatus.AWAITING_REVIEW : undefined,
                status: isPrescriptionRequired ? OrderStatus.PENDING : OrderStatus.PROCESSING,
            });

            const savedOrder = await newOrder.save({ session });

            const razorpayOrder = await this.paymentsService.createRazorpayOrder(
                savedOrder.totalAmount,
                'INR',
                (savedOrder as any)._id.toString()
            );

            await this.orderModel.findByIdAndUpdate(
                savedOrder._id,
                { razorpayOrderId: razorpayOrder.id },
                { session, new: true }
            ).exec();

            await session.commitTransaction();
            console.log(`OrdersService - createOrderFromCart: Order ${(savedOrder as any)._id} created, Razorpay order ${razorpayOrder.id} generated.`);

            return savedOrder;

        } catch (error) {
            await session.abortTransaction();
            console.error('OrdersService - createOrderFromCart: Transaction failed, rolling back:', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to process checkout. Please try again.');
        } finally {
            session.endSession();
        }
    }

    // NEW METHOD: Added for stock management via webhook
    async decrementStock(orderItems: OrderItem[]): Promise<void> {
        try {
            const bulkOps = orderItems.map(item => ({
                updateOne: {
                    filter: { _id: item.productId, stock: { $gte: item.quantity } },
                    update: { $inc: { stock: -item.quantity } },
                },
            }));

            const result = await this.productModel.bulkWrite(bulkOps);

            if (result.modifiedCount !== orderItems.length) {
                // This scenario indicates a potential race condition where stock was updated by another process
                // after the order was placed but before the payment was confirmed.
                // You might want to handle this by marking the order as FAILED or in a specific state.
                throw new InternalServerErrorException('Failed to decrement stock for all items.');
            }
        } catch (error) {
            console.error('OrdersService - decrementStock: Error updating product stock:', error);
            throw new InternalServerErrorException('Failed to update product stock.');
        }
    }

    async updatePrescriptionStatus(orderId: string, status: PrescriptionStatus, adminId: Types.ObjectId): Promise<OrderDocument | null> {
        const order = await this.orderModel.findById(orderId).exec();
        if (!order) {
            throw new NotFoundException('Order not found.');
        }

        if (!order.isPrescriptionRequired) {
            throw new BadRequestException('This order does not require a prescription.');
        }

        if (order.prescriptionStatus !== PrescriptionStatus.AWAITING_REVIEW) {
            throw new BadRequestException(`Prescription status has already been reviewed. Current status: ${order.prescriptionStatus}.`);
        }

        const updatedOrder = await this.orderModel.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    prescriptionStatus: status,
                    status: status === PrescriptionStatus.APPROVED ? OrderStatus.PROCESSING : OrderStatus.PENDING,
                },
            },
            { new: true, runValidators: true }
        ).exec();

        return updatedOrder;
    }

    async findAll(): Promise<OrderDocument[]> { return await this.orderModel.find().populate('userId', 'email firstName lastName').exec(); }
    async findUserOrders(userId: Types.ObjectId): Promise<OrderDocument[]> { return await this.orderModel.find({ userId: userId }).exec(); }
    async findOne(orderId: string): Promise<OrderDocument | null> { return await this.orderModel.findById(orderId).populate('userId', 'email firstName lastName').exec(); }
    async update(orderId: string, updateOrderDto: UpdateOrderDto): Promise<OrderDocument | null> { return await this.orderModel.findByIdAndUpdate(orderId, updateOrderDto, { new: true, runValidators: true }).exec(); }
    async remove(orderId: string): Promise<OrderDocument | null> { return await this.orderModel.findByIdAndDelete(orderId).exec(); }
}