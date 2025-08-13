// File: kashmir-wellness-backend/src/addresses/addresses.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from '../schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  async create(createAddressDto: CreateAddressDto, userId: string): Promise<AddressDocument> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format.');
    }

    const newAddress = new this.addressModel({
      ...createAddressDto,
      userId: new Types.ObjectId(userId),
    });

    try {
      if (newAddress.isDefault) {
        await this.addressModel.updateMany(
          { userId: new Types.ObjectId(userId), _id: { $ne: newAddress._id } },
          { $set: { isDefault: false } }
        ).exec();
      }
      const savedAddress = await newAddress.save();
      console.log(`AddressesService.create: Address created for user ID: ${userId}`);
      return savedAddress;
    } catch (error) {
      console.error('Error creating address:', error);
      throw new InternalServerErrorException('Failed to create address.');
    }
  }

  async findAllByUser(userId: string): Promise<AddressDocument[]> {
    if (!Types.ObjectId.isValid(userId)) { // Validate userId
      throw new BadRequestException('Invalid user ID format.');
    }
    return this.addressModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async findOneById(id: string, userId: string): Promise<AddressDocument | null> {
     console.log(`AddressesService.findOneById received - id: '${id}', userId: '${userId}'`); 
    console.log(`AddressesService.findOneById validation - id valid: ${Types.ObjectId.isValid(id)}`); 
    console.log(`AddressesService.findOneById validation - userId valid: ${Types.ObjectId.isValid(userId)}`);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID format.');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format.');
    }
    return this.addressModel.findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }).exec();
  }

  async update(id: string, updateAddressDto: UpdateAddressDto, userId: string): Promise<AddressDocument | null> {
    // Validate both IDs
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID format.');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format.');
    }

    const objectId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);

    // If setting this address as default, unset other defaults first
    if (updateAddressDto.isDefault) {
      await this.addressModel.updateMany(
        { userId: userObjectId, _id: { $ne: objectId } },
        { $set: { isDefault: false } }
      ).exec();
    }
    const updatedAddress = await this.addressModel.findOneAndUpdate(
      { _id: objectId, userId: userObjectId },
      { $set: updateAddressDto },
      { new: true }
    ).exec();

    return updatedAddress;
  }

  async remove(id: string, userId: string): Promise<AddressDocument | null> {
    // Validate both IDs
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID format.');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format.');
    }

    const objectId = new Types.ObjectId(id);
    const userObjectId = new Types.ObjectId(userId);

    const deletedAddress = await this.addressModel.findOneAndDelete(
      { _id: objectId, userId: userObjectId }
    ).exec();

    if (!deletedAddress) {
      throw new NotFoundException(`Address with ID "${id}" not found or not owned by you.`);
    }
    return deletedAddress;
  }
}