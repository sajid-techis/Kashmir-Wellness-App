import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Model, Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';


describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: any;
  let categoryModel: { countDocuments: jest.Mock };

  beforeEach(async () => {
    const mockProductModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ name: 'Saved' }),
    }));
    mockProductModel.find = jest.fn();
    mockProductModel.findById = jest.fn();
    mockProductModel.findByIdAndUpdate = jest.fn();
    mockProductModel.findByIdAndDelete = jest.fn();

    const mockCategoryModel = { countDocuments: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: getModelToken(Category.name), useValue: mockCategoryModel },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get(getModelToken(Product.name));
    categoryModel = module.get(getModelToken(Category.name));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a product when categories exist', async () => {
      categoryModel.countDocuments.mockResolvedValue(1);
      const dto: any = { name: 'P', price: 10, categoryIds: ['1'] };
      const result = await service.create(dto);
      expect(result).toEqual({ name: 'Saved' });
      expect(categoryModel.countDocuments).toHaveBeenCalledWith({
        _id: { $in: dto.categoryIds },
      });
    });

    it('should throw BadRequestException when category IDs are invalid', async () => {
      categoryModel.countDocuments.mockResolvedValue(0);
      const dto: any = { name: 'P', price: 10, categoryIds: ['1'] };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const docs = [{ name: 'A' }];
      productModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(docs) });
      const result = await service.findAll();
      expect(result).toEqual(docs);
      expect(productModel.find).toHaveBeenCalledWith({});
    });

    it('should filter by category id', async () => {
      const docs = [{ name: 'A' }];
      productModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(docs) });
      const id = new Types.ObjectId().toString();
      await service.findAll(id);
      expect(productModel.find).toHaveBeenCalledWith({ categoryIds: new Types.ObjectId(id) });
    });

    it('should throw for invalid category id', async () => {
      await expect(service.findAll('bad-id')).rejects.toThrow(BadRequestException);
    });
  });
});
