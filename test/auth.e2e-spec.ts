import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest'; // <-- FIX: Changed the import style
import { AppModule } from './../src/app.module';
import { Connection, Model } from 'mongoose';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose'; // <-- FIX: Import getConnectionToken
import { User, UserDocument } from '../src/schemas/user.schema';
import { Doctor, DoctorDocument } from '../src/schemas/doctor.schema';
import { Argon2Service } from '@nestjs/argon2';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../src/common/enums/role.enum';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<UserDocument>;
  let doctorModel: Model<DoctorDocument>;
  let connection: Connection;
  let jwtService: JwtService;
  const argon2 = new Argon2Service();

  const testUser = {
    email: 'testprovider@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userModel = moduleFixture.get<Model<UserDocument>>(getModelToken(User.name));
    doctorModel = moduleFixture.get<Model<DoctorDocument>>(getModelToken(Doctor.name));
    // --- V V V THIS IS THE FIX V V V ---
    // Use getConnectionToken() to get the correct provider for the database connection
    connection = moduleFixture.get<Connection>(getConnectionToken());
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    await doctorModel.deleteMany({});
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  describe('/auth/provider/login (POST)', () => {
    it('should correctly log in a user with a provider profile and return a valid JWT', async () => {
      const hashedPassword = await argon2.hash(testUser.password);
      const user = await userModel.create({
        email: testUser.email,
        password: hashedPassword,
      });

      const doctor = await doctorModel.create({
        name: 'Dr. Test E2E',
        email: 'doctore2e@example.com',
        userId: (user as any)._id,
        qualification: 'E2E',
        registrationNumber: 'E2E123',
        consultationFee: 100,
        specialization: 'E2E',
        phoneNumber: '1234567890',
        services: [{ name: 'Consultation', price: 100 }],
      });
      
      user.role = Role.Provider;
      user.providerProfile = {
        providerId: (doctor as any)._id,
        providerModel: 'Doctor',
      };
      await user.save();

      const response = await request(app.getHttpServer())
        .post('/auth/provider/login')
        .send(testUser)
        .expect(200);

      expect(response.body.accessToken).toBeDefined();

      const token = response.body.accessToken;
      const decodedToken: any = jwtService.decode(token);
      
      expect(decodedToken.email).toEqual(testUser.email);
      expect(decodedToken.sub).toEqual((user as any)._id.toString());
      expect(decodedToken.providerModel).toEqual('Doctor');
      expect(decodedToken.providerId).toEqual((doctor as any)._id.toString());
    });

    it('should fail if the user is not a provider', async () => {
        const hashedPassword = await argon2.hash(testUser.password);
        await userModel.create({
          email: testUser.email,
          password: hashedPassword,
          role: Role.User,
        });
  
        await request(app.getHttpServer())
          .post('/auth/provider/login')
          .send(testUser)
          .expect(401); // Unauthorized
      });
  });
});