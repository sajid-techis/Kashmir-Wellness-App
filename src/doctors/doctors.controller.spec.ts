// File: kashmir-wellness-backend/src/doctors/doctors.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module'; // Import the main AppModule
import { DoctorsController } from './doctors.controller';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';
import { Doctor } from '../schemas/doctor.schema';

describe('DoctorsController (Integration)', () => {
  let app: INestApplication;
  let doctorsController: DoctorsController;
  let userModel: Model<UserDocument>;
  let doctorModel: Model<Doctor>;
  let testUser: UserDocument;

  beforeAll(async () => {
    // 1. Create a test version of our entire application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 2. Get instances of our controller and database models
    doctorsController = moduleFixture.get<DoctorsController>(DoctorsController);
    userModel = moduleFixture.get<Model<UserDocument>>(getModelToken(User.name));
    doctorModel = moduleFixture.get<Model<Doctor>>(getModelToken(Doctor.name));
  });

  // 3. Before each test, create a fresh user to link the doctor to
  beforeEach(async () => {
    testUser = await userModel.create({
      email: `testuser-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    });
  });

  // 4. After each test, clean up the database
  afterEach(async () => {
    await userModel.deleteMany({});
    await doctorModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  // --- THIS IS OUR INTEGRATION TEST ---
  describe('create', () => {
    it('should successfully create a doctor and update the user', async () => {
      // ARRANGE: Set up the data for our new doctor
      const createDoctorDto: CreateDoctorDto = {
        name: 'Dr. Integration Test',
        email: 'integration.test@doctor.com',
        phoneNumber: '+919988776655',
        qualification: 'MBBS, MD',
        specialization: 'Integration Testing',
        registrationNumber: `TEST-${Date.now()}`,
        consultationFee: 1000,
        userId: testUser._id.toHexString(), // Link to our newly created user
      };

      // ACT: Call the actual controller method
      const createdDoctor = await doctorsController.create(createDoctorDto);

      // ASSERT (Part 1): Check the returned doctor object
      expect(createdDoctor).toBeDefined();
      expect(createdDoctor.name).toEqual(createDoctorDto.name);
      expect(createdDoctor.email).toEqual(createDoctorDto.email);
      expect(createdDoctor.services).toHaveLength(1);
      expect(createdDoctor.services[0].name).toEqual('Consultation');
      expect(createdDoctor.services[0].price).toEqual(1000);

      // ASSERT (Part 2): Verify the changes in the database
      const updatedUser = await userModel.findById(testUser._id);
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.role).toEqual('provider');
      expect(updatedUser?.providerProfile).toBeDefined();
      expect(updatedUser?.providerProfile?.providerId.toHexString()).toEqual(createdDoctor._id.toHexString());
      expect(updatedUser?.providerProfile?.providerModel).toEqual('Doctor');
    });

    it('should throw an error if the userId does not exist', async () => {
        const nonExistentUserId = '652d3f7b2c9384a2b9d3c1a9'; // A random, non-existent ID
        const createDoctorDto: CreateDoctorDto = {
            name: 'Dr. Ghost',
            email: 'ghost@doctor.com',
            phoneNumber: '+919988776654',
            qualification: 'MBBS',
            specialization: 'Ghosts',
            registrationNumber: `GHOST-${Date.now()}`,
            consultationFee: 500,
            userId: nonExistentUserId,
        };

        // Assert that calling the create method with a bad ID will be rejected
        await expect(doctorsController.create(createDoctorDto)).rejects.toThrow(
            `User with ID "${nonExistentUserId}" not found.`
        );
    });
  });
});