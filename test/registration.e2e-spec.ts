import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('Registration (e2e)', () => {
  let app: INestApplication;
  const mockAuthService = { register: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }) };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'pass' })
      .expect(201)
      .expect({ id: '1', email: 'test@example.com' });
  });
});
