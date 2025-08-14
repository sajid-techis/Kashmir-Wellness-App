import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order } from '../schemas/order.schema';
import { Product } from '../schemas/product.schema';
import { Address } from '../schemas/address.schema';
import { User } from '../schemas/user.schema';
import { CartService } from '../cart/cart.service';
import { PaymentsService } from '../payments/payments.service';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';


describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: any;
  let productModel: { findById: jest.Mock };

  beforeEach(async () => {
    const mockOrderModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ _id: 'orderId', ...dto }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Product.name), useValue: { findById: jest.fn() } },
        { provide: getModelToken(Address.name), useValue: {} },
        { provide: getModelToken(User.name), useValue: {} },
        { provide: CartService, useValue: {} },
        { provide: PaymentsService, useValue: {} },
        { provide: getConnectionToken(), useValue: {} },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get(getModelToken(Order.name));
    productModel = module.get(getModelToken(Product.name));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create an order with valid products', async () => {
      productModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'p1',
          name: 'Prod',
          price: 5,
          images: ['img'],
        }),
      });

      const dto: any = {
        items: [{ productId: 'p1', quantity: 2 }],
        shippingAddress: {
          street: 'a',
          city: 'b',
          state: 'c',
          zipCode: 'd',
          country: 'e',
        },
      };

      const result = await service.create(dto, new Types.ObjectId());
      expect(result.totalAmount).toBe(10);
      expect(orderModel).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product missing', async () => {
      productModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      const dto: any = {
        items: [{ productId: 'p1', quantity: 1 }],
        shippingAddress: { street: 'a', city: 'b', state: 'c', zipCode: 'd', country: 'e' },
      };
      await expect(service.create(dto, new Types.ObjectId())).rejects.toThrow(NotFoundException);
    });
  });
});
