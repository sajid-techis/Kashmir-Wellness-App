import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Ensure this path is correct
import { RolesGuard } from '../common/guards/roles.guard'; // <-- IMPORT RolesGuard
import { Roles } from '../common/decorators/roles.decorator'; // <-- IMPORT Roles decorator
import { Role } from '../common/enums/role.enum'; // <-- IMPORT Role enum
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    role: string; // Ensure this is present from JWT payload
  };
}

@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
// Apply JwtAuthGuard globally to the controller, then RolesGuard for specific methods
@UseGuards(JwtAuthGuard, RolesGuard) // <-- Apply both guards here
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // NOTE: This POST /users endpoint for creating users is typically for ADMINS.
  // Public registration usually goes through AuthController.
  @Post()
  @Roles(Role.Admin) // <-- Only Admins can create users directly
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password, ...result } = user.toObject();
    return result;
  }

  // Get all users - Only Admins can see all users
  @Get()
  @Roles(Role.Admin) // <-- Only Admins can list all users
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.usersService.findAll();
  }

   @Get('me') // New endpoint: /users/me
  @HttpCode(HttpStatus.OK)
  // JwtAuthGuard is already applied globally, so no need for @UseGuards here.
  // No @Roles() needed, as any authenticated user can get their OWN profile.
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user._id; // Get user ID from JWT payload
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      // This case should ideally not happen if JwtAuthGuard passed, but good for robustness
      throw new NotFoundException(`Authenticated user with ID "${userId}" not found.`);
    }
    const { password, ...result } = user.toObject(); // Exclude password
    return result;
  }

  // Get user by ID
  @Get(':id')
  @Roles(Role.Admin) // <-- Admins can get any user by ID
  // You might also add logic here for a user to get their own profile (if id matches req.user._id)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) { // For now, this is Admin-only
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    const { password, ...result } = user.toObject();
    return result;
  }

  // Endpoint for authenticated user to update their own profile
  @Patch('profile')
  // JwtAuthGuard is already applied at controller level, no need to repeat here.
  // No @Roles() here, as any authenticated user can update their OWN profile.
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req: AuthenticatedRequest, @Body() updateUserProfileDto: UpdateUserDto) {
    const userId = req.user._id; // Get user ID from JWT payload
    const updatedUser = await this.usersService.update(userId, updateUserProfileDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }
    return updatedUser;
  }

  // Update any user by ID - Only Admins can do this
  @Patch(':id')
  @Roles(Role.Admin) // <-- Only Admins can update any user by ID
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return updatedUser;
  }

  // Remove user by ID - Only Admins can do this
  @Delete(':id')
  @Roles(Role.Admin) // <-- Only Admins can delete users
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const deletedUser = await this.usersService.remove(id);
    if (!deletedUser) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
  }
}