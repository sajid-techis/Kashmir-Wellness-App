import { Controller, Post, Headers, Req, HttpCode, RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('webhook')
    @HttpCode(200)
    async handleRazorpayWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('x-razorpay-signature') signature: string,
    ): Promise<void> {
        await this.paymentsService.handleWebhook(req.rawBody, signature);
    }
}