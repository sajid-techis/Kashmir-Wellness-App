// File: kashmir-wellness-backend/src/labs/labs.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LabsService } from './labs.service';
import { Lab, LabDocument } from '../schemas/lab.schema';
import { NotFoundException } from '@nestjs/common';

const mockLab = {
  _id: new Types.ObjectId(),
  name: 'Test Lab',
  email: 'test@lab.com',
  userId: new Types.ObjectId(),
  services: [{ name: 'Blood Test', price: 600 }],
  location: { type: 'Point', coordinates: [10, 20] },
};

describe('LabsService', () => {
  let service: LabsService;
  let model: Model<LabDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabsService,
        {
          provide: getModelToken(Lab.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LabsService>(LabsService);
    model = module.get<Model<LabDocument>>(getModelToken(Lab.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test an inherited method
  describe('findOne (inherited)', () => {
    it('should find and return a lab by ID', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLab),
      } as any);

      const result = await service.findOne(mockLab._id.toHexString());
      expect(result).toEqual(mockLab);
      expect(model.findById).toHaveBeenCalledWith(mockLab._id.toHexString());
    });
  });

  // Test a lab-specific method
  describe('findLabsNear (specific)', () => {
    it('should call aggregate with the correct geoNear pipeline', async () => {
      const labs = [mockLab];
      jest.spyOn(model, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(labs),
      } as any);

      const result = await service.findLabsNear(10, 20, 5);
      expect(result).toEqual(labs);
      expect(model.aggregate).toHaveBeenCalledWith([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [10, 20] },
            distanceField: 'distance',
            maxDistance: 5000,
            spherical: true,
          },
        },
      ]);
    });
  });
});