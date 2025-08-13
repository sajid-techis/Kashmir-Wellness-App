import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../schemas/order.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Address, AddressSchema } from '../schemas/address.schema';
import { User, UserSchema } from '../schemas/user.schema'; // <-- NEW IMPORT
import { CartModule } from '../cart/cart.module';
import { PaymentsModule } from '../payments/payments.module'; // <-- NEW IMPORT

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Address.name, schema: AddressSchema },
      { name: User.name, schema: UserSchema }, // <-- NEW LINE: Import the User schema
    ]),
    CartModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}