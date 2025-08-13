import { Injectable, NotFoundException,InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';
import { Lab, LabDocument } from '../schemas/lab.schema';
import { Hospital, HospitalDocument } from '../schemas/hospital.schema';
import { UpdateProviderDto } from './dto/update-provider.dto';


@Injectable()
export class ProvidersService {
    constructor(
        @InjectModel(Doctor.name) private readonly doctorModel: Model<DoctorDocument>,
        @InjectModel(Lab.name) private readonly labModel: Model<LabDocument>,
        @InjectModel(Hospital.name) private readonly hospitalModel: Model<HospitalDocument>,
    ) { }

    // --- THIS IS THE REPLACEMENT METHOD ---
   async findAll(type?: string, search?: string): Promise<any[]> {
        try {
            // Explicitly type the promises array to fix the TypeScript error
            const promises: Promise<any[]>[] = [];

            // Use a case-insensitive regex search. It's more flexible than $text search for this use case.
            const searchQuery = search ? { name: { $regex: search, $options: 'i' } } : {};

            if (!type || type === 'doctor') {
                promises.push(
                    this.doctorModel.find(searchQuery).exec()
                        .then(docs => docs.map(d => ({ ...d.toObject(), providerType: 'Doctor' })))
                );
            }
            if (!type || type === 'lab') {
                promises.push(
                    this.labModel.find(searchQuery).exec()
                        .then(labs => labs.map(l => ({ ...l.toObject(), providerType: 'Lab' })))
                );
            }
            if (!type || type === 'hospital') {
                promises.push(
                    this.hospitalModel.find(searchQuery).exec()
                        .then(hospitals => hospitals.map(h => ({ ...h.toObject(), providerType: 'Hospital' })))
                );
            }
            
            const results = await Promise.all(promises);
            // Flatten the array of arrays (e.g., [[doctors], [labs]]) into a single array
            return results.flat();

        } catch (error) {
            console.error('Error searching providers:', error);
            throw new InternalServerErrorException('An error occurred while searching for providers.');
        }
    }

   async getProviderProfile(providerId: string, providerModel: string) {
        let profile: DoctorDocument | LabDocument | HospitalDocument | null = null;
        let modelName: string = '';

        switch (providerModel.toLowerCase()) {
            case 'doctor':
                profile = await this.doctorModel.findById(providerId).exec();
                modelName = 'Doctor';
                break;
            case 'lab':
                profile = await this.labModel.findById(providerId).exec();
                modelName = 'Lab';
                break;
            case 'hospital':
                profile = await this.hospitalModel.findById(providerId).exec();
                modelName = 'Hospital';
                break;
            default:
                throw new NotFoundException('Provider type not found.');
        }

        if (!profile) {
            throw new NotFoundException(`${modelName} profile not found.`);
        }

        // --- THIS IS THE FIX ---
        // Convert the Mongoose document to a plain object
        const profileObject = profile.toObject();
        // Manually add the providerType field for consistency
        (profileObject as any).providerType = modelName;
        
        return profileObject;
        // --- END FIX ---
    }

    async updateProviderProfile(
        providerId: string,
        providerModel: string,
        updateProviderDto: UpdateProviderDto,
    ) {
        let profile: DoctorDocument | LabDocument | HospitalDocument | null = null;
        let modelName: string = '';

        switch (providerModel.toLowerCase()) {
            case 'doctor':
                profile = await this.doctorModel.findByIdAndUpdate(providerId, updateProviderDto, { new: true }).exec();
                modelName = 'Doctor';
                break;
            case 'lab':
                profile = await this.labModel.findByIdAndUpdate(providerId, updateProviderDto, { new: true }).exec();
                modelName = 'Lab';
                break;
            case 'hospital':
                profile = await this.hospitalModel.findByIdAndUpdate(providerId, updateProviderDto, { new: true }).exec();
                modelName = 'Hospital';
                break;
            default:
                throw new NotFoundException('Provider type not found.');
        }

        if (!profile) {
            throw new NotFoundException(`${modelName} profile not found.`);
        }

        return profile;
    }
}