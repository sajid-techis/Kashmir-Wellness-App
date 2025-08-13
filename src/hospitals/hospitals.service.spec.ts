// File: kashmir-wellness-backend/src/hospitals/hospitals.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HospitalsService } from './hospitals.service';
import { Hospital, HospitalDocument } from '../schemas/hospital.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

// --- A simpler and more direct mock object ---
const mockHospital = {
  _id: new Types.ObjectId(),
  name: 'Test Hospital',
  email: 'test@hospital.com',
  phoneNumber: '1234567890',
  address: '123 Test St',
  location: {
    type: 'Point',
    coordinates: [0, 0],
  },
  departments: ['Cardiology'],
  averageRating: 0,
  reviewCount: 0,
  services: [],
  isActive: true,
  userId: new Types.ObjectId(),
  toHexString: function() { return this._id.toHexString() } // Helper for tests
};

describe('HospitalsService', () => {
  let service: HospitalsService;
  let model: Model<HospitalDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HospitalsService,
        {
          provide: getModelToken(Hospital.name),
          // Directly provide a mock implementation for the functions we use
          useValue: {
            new: jest.fn().mockResolvedValue(mockHospital),
            constructor: jest.fn().mockResolvedValue(mockHospital),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HospitalsService>(HospitalsService);
    model = module.get<Model<HospitalDocument>>(getModelToken(Hospital.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne (inherited)', () => {
    it('should find and return a hospital by ID', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockHospital),
      } as any);

      const result = await service.findOne(mockHospital._id.toHexString());
      expect(result).toEqual(mockHospital);
      expect(model.findById).toHaveBeenCalledWith(mockHospital._id.toHexString());
    });

    it('should throw NotFoundException if hospital is not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      const id = new Types.ObjectId().toHexString();
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for an invalid ID format', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update (specific)', () => {
    it('should update and return the hospital', async () => {
      const updateDto: UpdateHospitalDto = { name: 'Updated Hospital' };
      const updatedHospital = { ...mockHospital, ...updateDto };

      // Mock the findOne call which uses findById internally
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockHospital),
      } as any);
      
      // Mock the findByIdAndUpdate call
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedHospital),
      } as any);

      const result = await service.update(mockHospital._id.toHexString(), updateDto);

      expect(result.name).toEqual('Updated Hospital');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockHospital._id.toHexString(),
        updateDto,
        { new: true },
      );
    });
  });
});