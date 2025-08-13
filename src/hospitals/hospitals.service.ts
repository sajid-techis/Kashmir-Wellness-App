// File: kashmir-wellness-backend/src/hospitals/hospitals.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Hospital, HospitalDocument } from '../schemas/hospital.schema';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { BaseProviderService } from '../providers/base-provider.service';
import { User, UserDocument } from '../schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class HospitalsService extends BaseProviderService<HospitalDocument> {
  constructor(
    @InjectModel(Hospital.name) hospitalModel: Model<HospitalDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    super(hospitalModel);
  }

  async create(createHospitalDto: CreateHospitalDto): Promise<HospitalDocument> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const user = await this.userModel.findById(createHospitalDto.userId).session(session);
      if (!user) {
        throw new BadRequestException(`User with ID "${createHospitalDto.userId}" not found.`);
      }
      if (user.providerProfile) {
        throw new BadRequestException('This user is already linked to a provider profile.');
      }

      const newHospital = new this.model(createHospitalDto);
      const savedHospital = await newHospital.save({ session });

      user.role = Role.Provider;
      user.providerProfile = {
        providerId: (savedHospital as any)._id,
        providerModel: 'Hospital',
      };
      await user.save({ session });

      await session.commitTransaction();
      return savedHospital;
    } catch (error) {
      await session.abortTransaction();
      if ((error as any).code === 11000) {
        throw new BadRequestException('A hospital with this name, email, or user ID already exists.');
      }
      throw new InternalServerErrorException('Failed to create hospital profile.', (error as Error).message);
    } finally {
      session.endSession();
    }
  }

  async update(
    id: string,
    updateHospitalDto: UpdateHospitalDto,
  ): Promise<HospitalDocument> {
    await this.findOne(id);
    const updatedHospital = await this.model
      .findByIdAndUpdate(id, updateHospitalDto, { new: true })
      .exec();

    if (!updatedHospital) {
      throw new NotFoundException(`Hospital with ID "${id}" not found.`);
    }
    return updatedHospital;
  }

  async findHospitalsNear(
    longitude: number,
    latitude: number,
    maxDistanceKm: number = 10,
  ): Promise<HospitalDocument[]> {
    return this.model.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          maxDistance: maxDistanceKm * 1000,
          spherical: true,
        },
      },
    ]).exec();
  }
}