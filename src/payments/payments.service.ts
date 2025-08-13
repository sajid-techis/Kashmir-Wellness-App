import { Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { Order, OrderDocument, OrderStatus } from '../schemas/order.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private instance: Razorpay;
    private razorpayWebhookSecret: string;

    constructor(
        private configService: ConfigService,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @Inject(forwardRef(() => OrdersService)) private ordersService: OrdersService,
        private cartService: CartService,
    ) {
        this.instance = new Razorpay({
            key_id: this.configService.getOrThrow<string>('RAZORPAY_KEY_ID'),
            key_secret: this.configService.getOrThrow<string>('RAZORPAY_KEY_SECRET'),
        });
        this.razorpayWebhookSecret = this.configService.getOrThrow<string>('RAZORPAY_WEBHOOK_SECRET');
    }

    async createRazorpayOrder(amount: number, currency: string, receiptId: string) {
        try {
            const options = {
                amount: amount * 100,
                currency: currency,
                receipt: receiptId,
            };
            const order = await this.instance.orders.create(options);
            return order;
        } catch (error) {
            this.logger.error('Failed to create Razorpay order.', error.stack);
            throw new InternalServerErrorException('Failed to create Razorpay order.');
        }
    }

    async handleWebhook(rawBody: any, signature: string): Promise<void> {
        try {
            const isSignatureValid = validateWebhookSignature(rawBody, signature, this.razorpayWebhookSecret);

            if (!isSignatureValid) {
                this.logger.warn('Webhook signature mismatch. Request may be spoofed.');
                throw new UnauthorizedException('Invalid webhook signature');
            }

            const payload = JSON.parse(rawBody.toString());
            this.logger.log(`Received Razorpay webhook event: ${payload.event}`);

            switch (payload.event) {
                case 'payment.captured':
                case 'order.paid':
                    await this.processPaymentSuccess(payload);
                    break;
                case 'payment.failed':
                    await this.processPaymentFailure(payload);
                    break;
                default:
                    this.logger.warn(`Unhandled webhook event: ${payload.event}`);
                    break;
            }
        } catch (error) {
            this.logger.error('Error processing webhook.', error.stack);
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Webhook processing failed.');
        }
    }

    private async processPaymentSuccess(payload: any): Promise<void> {
        const orderId = payload.payload.payment.entity.order_id;
        const razorpayPaymentId = payload.payload.payment.entity.id;
        const totalAmount = payload.payload.payment.entity.amount / 100;

        this.logger.log(`Processing successful payment for Razorpay Order ID: ${orderId}`);

        const order = await this.orderModel.findOneAndUpdate(
            { razorpayOrderId: orderId, totalAmount },
            {
                status: OrderStatus.PROCESSING,
                razorpayPaymentId: razorpayPaymentId,
                paymentStatus: 'paid'
            },
            { new: true }
        ).exec();

        if (!order) {
            this.logger.error(`Order with Razorpay ID ${orderId} not found or amount mismatch.`);
            throw new BadRequestException('Order not found or payment amount mismatch.');
        }
        await this.cartService.clearCart(order.userId.toString()); 
        await this.ordersService.decrementStock(order.items);

        this.logger.log(`Order ${(order as any)._id.toString()} status updated to PROCESSING.`);
        this.logger.log(`Cart for user ${order.userId} cleared.`);
    }
    private async processPaymentFailure(payload: any): Promise<void> {
        const orderId = payload.payload.payment.entity.order_id;
        this.logger.warn(`Payment failed for Razorpay Order ID: ${orderId}`);

        await this.orderModel.findOneAndUpdate(
            { razorpayOrderId: orderId },
            { status: OrderStatus.FAILED, paymentStatus: 'failed' }
        ).exec();

        this.logger.log(`Order with Razorpay ID ${orderId} status updated to FAILED.`);
    }
}