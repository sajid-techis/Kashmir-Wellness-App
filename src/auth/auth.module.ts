import { Module } from '@nestjs/common';
import { Argon2Module } from '@nestjs/argon2';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { ProviderJwtStrategy } from './provider-jwt.strategy';
import { GoogleStrategy } from './google.strategy';

// Add the MongooseModule import
import { MongooseModule } from '@nestjs/mongoose';
// Add the provider schema imports
import { Doctor, DoctorSchema } from '../schemas/doctor.schema';
import { Lab, LabSchema } from '../schemas/lab.schema';
import { Hospital, HospitalSchema } from '../schemas/hospital.schema';
import { User, UserSchema } from '../schemas/user.schema';


@Module({
  imports: [
    UsersModule,
    PassportModule,
    Argon2Module,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION_TIME') || '3600s' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Lab.name, schema: LabSchema },
      { name: Hospital.name, schema: HospitalSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ProviderJwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule { }