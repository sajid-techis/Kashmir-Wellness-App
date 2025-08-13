import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common'; // <-- ADD BadRequestException
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category, CategoryDocument } from '../schemas/category.schema'; // <-- NEW IMPORT

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>, // <-- INJECT CATEGORY MODEL
  ) { }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // START OF NEW VALIDATION LOGIC
    if (createProductDto.categoryIds && createProductDto.categoryIds.length > 0) {
      const existingCategoriesCount = await this.categoryModel.countDocuments({
        _id: { $in: createProductDto.categoryIds },
      });

      if (existingCategoriesCount !== createProductDto.categoryIds.length) {
        throw new BadRequestException('One or more provided category IDs do not exist.');
      }
    }
    // END OF NEW VALIDATION LOGIC

    const createdProduct = new this.productModel(createProductDto);
    try {
      return await createdProduct.save();
    } catch (error) {
      console.error('Error creating product:', error);
      throw new InternalServerErrorException('Failed to create product.');
    }
  }

   async findAll(categoryId?: string): Promise<ProductDocument[]> {
    const filter = {};
    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('Invalid categoryId format.');
      }
      // Add categoryId to the filter if it's provided
      filter['categoryIds'] = new Types.ObjectId(categoryId);
    }
    return this.productModel.find(filter).exec();
  }

  async findOne(id: string): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.productModel.findById(id).exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument | null> {
    // NOTE: You should also add the same validation logic here for categoryIds!
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      { $set: updateProductDto },
      { new: true }
    ).exec();
    return updatedProduct;
  }

  async remove(id: string): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    return deletedProduct;
  }
}