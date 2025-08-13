import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { BaseProviderService } from '../providers/base-provider.service';
import { User, UserDocument } from '../schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class DoctorsService extends BaseProviderService<DoctorDocument> {
  constructor(
    @InjectModel(Doctor.name) doctorModel: Model<DoctorDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    super(doctorModel);
  }

  async create(createDoctorDto: CreateDoctorDto): Promise<DoctorDocument> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const user = await this.userModel.findById(createDoctorDto.userId).session(session);
      if (!user) {
        throw new BadRequestException(`User with ID "${createDoctorDto.userId}" not found.`);
      }
      if (user.providerProfile) {
        throw new BadRequestException('This user is already linked to a provider profile.');
      }
      const newDoctor = new this.model({
        ...createDoctorDto,
        services: [{ name: 'Consultation', price: createDoctorDto.consultationFee }]
      });
      const savedDoctor = await newDoctor.save({ session });
      user.role = Role.Provider;
      user.providerProfile = {
        providerId: (savedDoctor as any)._id,
        providerModel: 'Doctor',
      };
      await user.save({ session });
      await session.commitTransaction();
      return savedDoctor;
    } catch (error) {
      await session.abortTransaction();
      if ((error as any).code === 11000) {
        throw new BadRequestException('A doctor with this email, registration number, or user ID already exists.');
      }
      throw new InternalServerErrorException('Failed to create doctor profile.', (error as Error).message);
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<DoctorDocument> {
    await this.findOne(id);
    const updatedDoctor = await this.model.findByIdAndUpdate(id, updateDoctorDto, { new: true }).exec();
    if (!updatedDoctor) {
      throw new NotFoundException(`Doctor with ID "${id}" not found.`);
    }
    return updatedDoctor;
  }
}