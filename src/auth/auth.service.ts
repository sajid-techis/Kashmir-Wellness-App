// File: kashmir-wellness-backend/src/auth/auth.service.ts

import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Argon2Service } from '@nestjs/argon2';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from '../schemas/user.schema'; // We need both User and UserDocument
import { Role } from '../common/enums/role.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
    private argon2: Argon2Service,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  // --- RETURN TYPE CHANGED ---
  async register(createAuthDto: RegisterDto): Promise<{ message: string; user: Omit<User, 'password'> }> {
    const existingUser = await this.usersService.findOneByEmail(createAuthDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }
    const hashedPassword = await this.argon2.hash(createAuthDto.password);
    const userObjectForCreation: CreateUserDto = {
      email: createAuthDto.email,
      password: hashedPassword,
      firstName: createAuthDto.firstName,
      lastName: createAuthDto.lastName,
      phoneNumber: createAuthDto.phoneNumber,
      role: Role.User,
    };
    const user = await this.usersService.create(userObjectForCreation);
    const { password, ...result } = user.toObject();
    return { message: 'User registered successfully.', user: result };
  }

  // --- RETURN TYPE CHANGED ---
  async login(loginAuthDto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const user = await this.usersService.findOneByEmail(loginAuthDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const isPasswordValid = await this.argon2.verify(user.password, loginAuthDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const payload = { email: user.email, sub: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const { password, ...result } = user.toObject();
    return { accessToken, user: result };
  }

  // --- RETURN TYPE CHANGED ---
  async providerLogin(loginAuthDto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const user = await this.usersService.findOneByEmail(loginAuthDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const isPasswordValid = await this.argon2.verify(user.password, loginAuthDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (user.role !== Role.Provider || !user.providerProfile) {
      throw new UnauthorizedException('User is not a registered provider or profile is incomplete.');
    }
    const payload = {
      email: user.email,
      sub: user._id,
      providerId: user.providerProfile.providerId,
      providerModel: user.providerProfile.providerModel,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const { password, ...result } = user.toObject();
    return { accessToken, user: result };
  }
  
  // ... (original googleLogin for web flow)

  // --- RETURN TYPE CHANGED ---
  async googleLoginMobile(idToken: string): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const googlePayload = ticket.getPayload();
      if (!googlePayload || !googlePayload.email) {
        throw new UnauthorizedException('Invalid Google token.');
      }

      let user = await this.userModel.findOne({ email: googlePayload.email }).exec();
      if (!user) {
        user = new this.userModel({
          email: googlePayload.email,
          firstName: googlePayload.given_name,
          lastName: googlePayload.family_name,
          role: Role.User,
        });
        await user.save();
      }
      
      const payload = { email: user.email, sub: user._id, role: user.role };
      const accessToken = this.jwtService.sign(payload);
      const { password, ...result } = user.toObject();
      return { accessToken, user: result };

    } catch (error) {
      console.error("Google mobile sign-in error:", error);
      throw new UnauthorizedException('Failed to authenticate with Google.');
    }
  }
}