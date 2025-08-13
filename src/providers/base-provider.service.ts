// File: kashmir-wellness-backend/src/providers/base-provider.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Document, Model, Types } from 'mongoose';
import { Service, ProviderAvailability } from '../schemas/availability.schema';
import { CreateAvailabilityDto } from '../doctors/dto/availability.dto';

interface ProviderDocument extends Document {
  services: Service[];
  availability?: ProviderAvailability;
  userId: Types.ObjectId;
}

@Injectable()
export abstract class BaseProviderService<T extends ProviderDocument> {
  // --- THIS IS THE FIX ---
  // Change 'private' to 'protected' to allow child classes to access the model.
  constructor(protected readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }
  
  // ... (The rest of the file remains exactly the same) ...
  async findOne(id: string): Promise<T> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${this.model.modelName} ID format.`);
    }
    const document = await this.model.findById(id).exec();
    if (!document) {
      throw new NotFoundException(
        `${this.model.modelName} with ID "${id}" not found.`,
      );
    }
    return document;
  }
  
  async findByUserId(userId: string): Promise<T | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid User ID format.');
    }
    return this.model.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  async remove(id: string): Promise<T> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${this.model.modelName} ID format.`);
    }
    const deletedDocument = await this.model.findByIdAndDelete(id).exec();
    if (!deletedDocument) {
      throw new NotFoundException(
        `${this.model.modelName} with ID "${id}" not found.`,
      );
    }
    return deletedDocument;
  }

  async updateServices(id: string, services: Service[]): Promise<T> {
    const document = await this.findOne(id);
    document.services = services;
    return document.save();
  }

  async getServices(id: string): Promise<Service[]> {
    const document = await this.findOne(id);
    return document.services;
  }

  async setAvailability(
    id: string,
    availabilityDto: CreateAvailabilityDto, // Accept the DTO from the controller
  ): Promise<T> {
    const document = await this.findOne(id);

    // Create a new ProviderAvailability object from the DTO
    const availabilityData: ProviderAvailability = {
      slots: availabilityDto.slots,
      slotDurationMinutes: availabilityDto.slotDurationMinutes,
      // Convert string dates to Date objects
      unavailableDates: availabilityDto.unavailableDates
        ? availabilityDto.unavailableDates.map(dateStr => new Date(dateStr))
        : [],
    };
    
    document.availability = availabilityData;
    return document.save();
  }

  async getAvailability(id: string): Promise<ProviderAvailability> {
    const document = await this.findOne(id);
    if (!document.availability) {
      throw new NotFoundException(
        `Availability schedule not found for ${this.model.modelName} with ID "${id}".`,
      );
    }
    return document.availability;
  }
}