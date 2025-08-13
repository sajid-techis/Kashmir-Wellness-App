import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // Import InjectModel
import { Model } from 'mongoose'; // Import Mongoose Model type
import { Patient, PatientDocument } from '../schemas/patient.schema'; // Import Patient and PatientDocument
import { CreatePatientDto } from './dto/create-patient.dto' // We will create this DTO next
import { UpdatePatientDto } from './dto/update-patient.dto' // We will create this DTO next

@Injectable()
export class PatientsService {
  // Inject the Mongoose Patient model
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    try {
      // Create a new patient document based on the DTO
      const createdPatient = new this.patientModel(createPatientDto);
      return await createdPatient.save();
    } catch (error) {
      // Handle duplicate email error
      if (error.code === 11000) { // MongoDB duplicate key error code
        throw new InternalServerErrorException('Patient with this email already exists.');
      }
      throw new InternalServerErrorException('Failed to create patient.', error.message);
    }
  }

  async findAll(): Promise<Patient[]> {
    // Find all patients and return them
    return await this.patientModel.find().exec();
  }

  async findOneById(id: string): Promise<Patient | null> {
    try {
      // Find a patient by ID
      const patient = await this.patientModel.findById(id).exec();
      return patient; // Returns null if not found
    } catch (error) {
      // If the ID format is invalid, Mongoose might throw a CastError
      if (error.name === 'CastError') {
        return null; // Treat invalid ID format as "not found"
      }
      throw new InternalServerErrorException('Failed to find patient.', error.message);
    }
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient | null> {
    try {
      // Find by ID and update the patient, return the new document
      const updatedPatient = await this.patientModel.findByIdAndUpdate(
        id,
        updatePatientDto,
        { new: true }, // 'new: true' returns the updated document
      ).exec();
      return updatedPatient; // Returns null if not found
    } catch (error) {
      if (error.code === 11000) {
        throw new InternalServerErrorException('Patient with this email already exists.');
      }
      throw new InternalServerErrorException('Failed to update patient.', error.message);
    }
  }

  async remove(id: string): Promise<Patient | null> {
    try {
      // Find by ID and delete the patient, return the deleted document
      const deletedPatient = await this.patientModel.findByIdAndDelete(id).exec();
      return deletedPatient; // Returns null if not found
    } catch (error) {
      if (error.name === 'CastError') {
        return null; // Treat invalid ID format as "not found"
      }
      throw new InternalServerErrorException('Failed to delete patient.', error.message);
    }
  }
}