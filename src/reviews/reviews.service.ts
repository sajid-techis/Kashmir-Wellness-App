// File: kashmir-wellness-backend/src/reviews/reviews.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Ensure Types is imported
import { Review, ReviewDocument } from '../schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Role } from '../common/enums/role.enum'; // Import Role enum for update logic

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  // MODIFIED METHOD: Create review now accepts userId from authenticated user
  async create(userId: string, createReviewDto: CreateReviewDto): Promise<ReviewDocument> {
    const createdReview = new this.reviewModel({
      ...createReviewDto,
      userId: new Types.ObjectId(userId), // Assign the user ID from the JWT
    });
    try {
      return await createdReview.save();
    } catch (error) {
      console.error('Error creating review:', error);
      throw new InternalServerErrorException('Failed to create review.');
    }
  }

  async findAll(): Promise<ReviewDocument[]> {
    // Populate user and product details for comprehensive review display
    return this.reviewModel.find().populate('userId', 'email firstName lastName').populate('productId', 'name').exec();
  }

  async findOne(id: string): Promise<ReviewDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.reviewModel.findById(id)
      .populate('userId', 'email firstName lastName')
      .populate('productId', 'name')
      .exec();
  }

  // NEW METHOD: Find reviews by product ID
  async findByProductId(productId: string): Promise<ReviewDocument[]> {
    if (!Types.ObjectId.isValid(productId)) {
      return []; // Or throw a BadRequestException
    }
    return this.reviewModel.find({ productId: new Types.ObjectId(productId) })
      .populate('userId', 'email firstName lastName')
      .exec();
  }


  // MODIFIED METHOD: Update review now includes userId and role for authorization logic
  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    requesterId: string, // ID of the user making the request
    requesterRole: Role, // Role of the user making the request
  ): Promise<ReviewDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const review = await this.reviewModel.findById(id).exec();

    if (!review) {
      return null; // Review not found
    }

    // Check authorization: Admin can update any review, User can only update their own
    if (requesterRole === Role.User && review.userId.toString() !== requesterId) {
      // If a regular user tries to update a review that's not theirs
      throw new NotFoundException(`Review with ID "${id}" not found or not authorized to update.`);
    }

    const updatedReview = await this.reviewModel.findByIdAndUpdate(
      id,
      { $set: updateReviewDto },
      { new: true }
    ).exec();

    return updatedReview;
  }

  // MODIFIED METHOD: Remove review now includes authorization logic (only for Admin for now)
  async remove(id: string): Promise<ReviewDocument | null> { // Removed userId and role for simplicity as only Admin can delete
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    // Note: The controller has @Roles(Role.Admin) for this method,
    // so only an Admin can reach this point.
    const deletedReview = await this.reviewModel.findByIdAndDelete(id).exec();
    return deletedReview;
  }
}