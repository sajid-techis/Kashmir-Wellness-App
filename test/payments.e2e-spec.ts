import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PaymentsController } from '../src/payments/payments.controller';
import { PaymentsService } from '../src/payments/payments.service';

describe('Payments (e2e)', () => {
  let app: INestApplication;
  const mockPaymentsService = { handleWebhook: jest.fn().mockResolvedValue(undefined) };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockPaymentsService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should process webhook', () => {
    return request(app.getHttpServer())
      .post('/payments/webhook')
      .set('x-razorpay-signature', 'sig')
      .send('{"event":"test"}')
      .expect(200)
      .then(() => {
        expect(mockPaymentsService.handleWebhook).toHaveBeenCalled();
      });
  });
});
