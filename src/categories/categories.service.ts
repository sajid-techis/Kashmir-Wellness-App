// File: kashmir-wellness-backend/src/categories/categories.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Ensure Types is imported
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    const createdCategory = new this.categoryModel(createCategoryDto);
    try {
      return await createdCategory.save();
    } catch (error) {
      console.error('Error creating category:', error);
      throw new InternalServerErrorException('Failed to create category.');
    }
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().exec();
  }

  // NEW/CORRECTED METHOD: findOne
  async findOne(id: string): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      // It's good practice to validate ObjectId format early
      // You could throw a BadRequestException here instead of returning null
      return null;
    }
    return this.categoryModel.findById(id).exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null; // Or throw a BadRequestException
    }
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      { $set: updateCategoryDto },
      { new: true } // Return the updated document
    ).exec();
    return updatedCategory;
  }

  async remove(id: string): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null; // Or throw a BadRequestException
    }
    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
    return deletedCategory;
  }
}