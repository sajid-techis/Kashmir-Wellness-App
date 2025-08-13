import { Module, forwardRef } from '@nestjs/common'; // <-- forwardRef MUST be imported
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review, ReviewSchema } from '../schemas/review.schema';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module'; // <-- Correct import path

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    UsersModule,
    forwardRef(() => ProductsModule), // <-- This is crucial for ReviewsModule importing ProductsModule
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}