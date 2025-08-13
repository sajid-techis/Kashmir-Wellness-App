import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ReviewsModule } from '../reviews/reviews.module';
import { Category, CategorySchema } from '../schemas/category.schema'; // <-- NEW IMPORT

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema }, // <-- ADD THIS LINE
    ]),
    forwardRef(() => ReviewsModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}