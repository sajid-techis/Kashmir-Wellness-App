// File: kashmir-wellness-backend/src/cart/cart.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartSchema } from '../schemas/cart.schema';
import { Product, ProductSchema } from '../schemas/product.schema'; // Import Product schema
import { ProductsModule } from '../products/products.module'; // Assuming you have a ProductsModule

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema }, // Register Product schema here too
    ]),
    // Import ProductsModule to make ProductService or ProductModel available
    // Use forwardRef if there's a circular dependency (e.g., ProductsModule also imports CartModule)
    ProductsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService], // Export CartService if other modules (like Orders) might need it
})
export class CartModule {}