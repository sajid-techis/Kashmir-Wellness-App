import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UsePipes,
  ValidationPipe,
  UseGuards, // <-- Import UseGuards
  Req,       // <-- Import Req
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // <-- Import JwtAuthGuard
import { RolesGuard } from '../common/guards/roles.guard'; // <-- IMPORT RolesGuard
import { Roles } from '../common/decorators/roles.decorator'; // <-- IMPORT Roles decorator
import { Role } from '../common/enums/role.enum'; // <-- IMPORT Role enum
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

@Controller('reviews')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Review creation requires authentication
  @Roles(Role.User) // Only regular users (and admins) can create reviews
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: AuthenticatedRequest, @Body() createReviewDto: CreateReviewDto) {
    // Assuming your CreateReviewDto has productId and rating, comment
    // And review will be tied to the authenticated user's ID (req.user._id)
    return await this.reviewsService.create(req.user._id, createReviewDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  // Anyone (even unauthenticated) can view all reviews
  async findAll() {
    return await this.reviewsService.findAll();
  }

  // Get reviews for a specific product
  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  // Anyone (even unauthenticated) can view reviews for a product
  async findReviewsByProduct(@Param('productId') productId: string) {
    return await this.reviewsService.findByProductId(productId);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  // Anyone (even unauthenticated) can view a single review
  async findOne(@Param('id') id: string) {
    const review = await this.reviewsService.findOne(id);
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }
    return review;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Update review requires authentication
  @Roles(Role.User) // A user can update their OWN review (need to add service logic for this)
  // OR an Admin can update any review
  @HttpCode(HttpStatus.OK)
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    // IMPORTANT: Add logic in ReviewsService.update to ensure user can only update their own review
    // OR if the user is an Admin, they can update any review.
    const updatedReview = await this.reviewsService.update(id, updateReviewDto, req.user._id, req.user.role as Role);
    if (!updatedReview) {
      throw new NotFoundException(`Review with ID "${id}" not found or not authorized to update.`);
    }
    return updatedReview;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Delete review requires authentication
  @Roles(Role.Admin) // Only Admins can delete reviews (or user can delete own, requires more logic)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const deletedReview = await this.reviewsService.remove(id);
    if (!deletedReview) {
      throw new NotFoundException(`Review with ID "${id}" not found.`);
    }
  }
}