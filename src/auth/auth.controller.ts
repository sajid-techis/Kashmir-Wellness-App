// File: kashmir-wellness-backend/src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe, Get, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; // Keep for potential future use if needed
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a regular user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('provider/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a provider' })
  async providerLogin(@Body() loginDto: LoginDto) {
    return this.authService.providerLogin(loginDto);
  }
  
  @Post('google/mobile-signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user via a Google ID token from a mobile app' })
  async googleMobileSignIn(@Body('idToken') idToken: string) {
    if (!idToken) {
      throw new BadRequestException('idToken is required');
    }
    return this.authService.googleLoginMobile(idToken);
  }
}