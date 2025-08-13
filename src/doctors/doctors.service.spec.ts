// File: kashmir-wellness-backend/src/doctors/doctors.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorsService } from './doctors.service';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// --- A simple, plain JavaScript object for mocking ---
const mockDoctor = {
  _id: new Types.ObjectId(),
  name: 'Dr. Test',
  email: 'test@doctor.com',
  specialization: 'Testing',
  userId: new Types.ObjectId(),
  qualification: 'MBBS',
  registrationNumber: '12345',
  consultationFee: 500,
  services: [{ name: 'Consultation', price: 500 }],
  phoneNumber: '1234567890',
  bio: 'A test doctor',
  experienceYears: 5,
  isActive: true,
  averageRating: 0,
  reviewCount: 0,
};

describe('DoctorsService', () => {
  let service: DoctorsService;
  let model: Model<DoctorDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorsService,
        {
          provide: getModelToken(Doctor.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
    model = module.get<Model<DoctorDocument>>(getModelToken(Doctor.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne (inherited)', () => {
    it('should find and return a doctor by ID', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoctor),
      } as any);

      // TypeScript understands mockDoctor._id because it's a plain object
      const result = await service.findOne(mockDoctor._id.toHexString());
      expect(result).toEqual(mockDoctor);
      expect(model.findById).toHaveBeenCalledWith(mockDoctor._id.toHexString());
    });
  });

  describe('findProviderIdByUserId (specific)', () => {
    it('should find a doctor by user ID and return their provider ID', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoctor),
      } as any);

      const userId = mockDoctor.userId;
      const result = await service.findProviderIdByUserId(userId.toHexString());

      expect(result).toEqual(mockDoctor._id.toString());
      expect(model.findOne).toHaveBeenCalledWith({ userId: userId });
    });
  });
});