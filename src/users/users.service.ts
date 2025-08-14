import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { User, UserDocument } from '../schemas/user.schema'; // Make sure UserDocument is imported
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Creates a new user. Expects `createUserDto.password` to be already hashed.
   * Role is defaulted by schema if not provided.
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> { // <--- CHANGE THIS FROM Promise<User>
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save(); // This correctly returns a UserDocument
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user.', error.message);
    }
  }

  async findAll(): Promise<UserDocument[]> { // <--- Also change this to UserDocument[] for consistency
    // Exclude password field from the result for security
    return await this.userModel.find().select('-password').exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> { // <--- Also change this
    const cacheKey = `user:${id}`;
    const cached = await this.cacheManager.get<UserDocument>(cacheKey);
    if (cached) {
      return cached;
    }
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      return null;
    }
    await this.cacheManager.set(cacheKey, user);
    return user;
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> { // <--- Also change this
    // This method should return the user document *including* the password for authentication validation
    return await this.userModel.findOne({ email }).exec();
  }

  /**
   * Updates a user. Expects `updateUserDto.password` to be already hashed if provided.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> { // <--- Also change this
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true, runValidators: true }
      ).select('-password').exec();
      if (!updatedUser) {
        return null;
      }
      await this.cacheManager.del(`user:${id}`);
      return updatedUser;
    } catch (error) {
      if (error.code === 11000) {
          throw new ConflictException('Email already in use by another user.');
      }
      throw new InternalServerErrorException('Failed to update user.', error.message);
    }
  }

  async remove(id: string): Promise<UserDocument | null> { // <--- Also change this
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        return null;
      }
      await this.cacheManager.del(`user:${id}`);
      return deletedUser;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user.', error.message);
    }

    }
}
