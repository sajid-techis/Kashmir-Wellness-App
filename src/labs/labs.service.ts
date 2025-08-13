// File: kashmir-wellness-backend/src/labs/labs.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Lab, LabDocument } from '../schemas/lab.schema';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { BaseProviderService } from '../providers/base-provider.service';
import { User, UserDocument } from '../schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class LabsService extends BaseProviderService<LabDocument> {
  constructor(
    @InjectModel(Lab.name) labModel: Model<LabDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    super(labModel);
  }

  async create(createLabDto: CreateLabDto): Promise<LabDocument> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const user = await this.userModel.findById(createLabDto.userId).session(session);
      if (!user) {
        throw new BadRequestException(`User with ID "${createLabDto.userId}" not found.`);
      }
      if (user.providerProfile) {
        throw new BadRequestException('This user is already linked to a provider profile.');
      }

      const newLab = new this.model(createLabDto);
      const savedLab = await newLab.save({ session });

      user.role = Role.Provider;
      user.providerProfile = {
        providerId: (savedLab as any)._id,
        providerModel: 'Lab',
      };
      await user.save({ session });

      await session.commitTransaction();
      return savedLab;
    } catch (error) {
      await session.abortTransaction();
      if ((error as any).code === 11000) {
        throw new BadRequestException('A lab with this name, email, or user ID already exists.');
      }
      throw new InternalServerErrorException('Failed to create lab profile.', (error as Error).message);
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateLabDto: UpdateLabDto): Promise<LabDocument> {
    await this.findOne(id);
    const updatedLab = await this.model
      .findByIdAndUpdate(id, updateLabDto, { new: true })
      .exec();

    if (!updatedLab) {
      throw new NotFoundException(`Lab with ID "${id}" not found.`);
    }
    return updatedLab;
  }
  
  async findProviderIdByUserId(userId: string): Promise<string> {
    const lab = await this.model
        .findOne({ userId: new Types.ObjectId(userId) })
        .exec();
    if (!lab) {
      throw new NotFoundException('Provider profile not found for this user.');
    }
    return (lab as any)._id.toString();
  }

  async findLabsNear(
    longitude: number,
    latitude: number,
    maxDistanceKm: number = 10,
  ): Promise<LabDocument[]> {
    return this.model
      .aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [longitude, latitude] },
            distanceField: 'distance',
            maxDistance: maxDistanceKm * 1000,
            spherical: true,
          },
        },
      ])
      .exec();
  }
}