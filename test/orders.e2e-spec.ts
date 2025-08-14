import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersService } from '../src/orders/orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../src/common/guards/roles.guard';

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = { _id: 'user1', role: 'User' };
    return true;
  }
}
class MockRolesGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

describe('Orders (e2e)', () => {
  let app: INestApplication;
  const mockOrdersService = { create: jest.fn().mockResolvedValue({ id: 'order1', totalAmount: 10 }) };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useClass(MockAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(MockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should place an order', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send({
        items: [{ productId: 'p1', quantity: 2 }],
        shippingAddress: { street: 'a', city: 'b', state: 'c', zipCode: 'd', country: 'e' },
      })
      .expect(201)
      .expect({ id: 'order1', totalAmount: 10 });
  });
});
