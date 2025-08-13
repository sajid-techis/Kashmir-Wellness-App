import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus } from '../schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';
import { Lab, LabDocument } from '../schemas/lab.schema';
import { Hospital, HospitalDocument } from '../schemas/hospital.schema';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        @InjectModel(Lab.name) private labModel: Model<LabDocument>,
        @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    ) { }

    async createAppointment(userId: string, createAppointmentDto: CreateAppointmentDto): Promise<AppointmentDocument> {
        const { providerId, providerModel, appointmentDate, startTime } = createAppointmentDto;

        let provider: any;
        const providerObjectId = new Types.ObjectId(providerId);
        
        switch (providerModel.toLowerCase()) {
            case 'doctor':
                provider = await this.doctorModel.findById(providerObjectId).exec();
                break;
            case 'lab':
                provider = await this.labModel.findById(providerObjectId).exec();
                break;
            case 'hospital':
                provider = await this.hospitalModel.findById(providerObjectId).exec();
                break;
        }

        if (!provider) {
            throw new NotFoundException(`Provider with ID "${providerId}" not found.`);
        }

        const appointmentDateTime = dayjs(appointmentDate).hour(parseInt(startTime.split(':')[0])).minute(parseInt(startTime.split(':')[1]));
        
        const existingAppointment = await this.appointmentModel.findOne({
            providerId: providerObjectId,
            appointmentDate: {
                $gte: appointmentDateTime.startOf('day').toDate(),
                $lte: appointmentDateTime.endOf('day').toDate(),
            },
            startTime: startTime,
            status: { $ne: AppointmentStatus.Cancelled },
        }).exec();

        if (existingAppointment) {
            throw new ConflictException('This time slot is no longer available.');
        }

        const consultationService = provider.services?.find(
            (s: any) => s.name.toLowerCase().includes('consultation') || s.price > 0
        );
        const serviceName = consultationService ? consultationService.name : 'Standard Service';
        const finalPrice = consultationService ? consultationService.price : (provider as DoctorDocument).consultationFee || 0;

        const newAppointment = new this.appointmentModel({
            userId: new Types.ObjectId(userId), // <-- FIX: Changed to userId
            providerId: providerObjectId,
            providerModel: providerModel,
            appointmentDate: appointmentDateTime.toDate(),
            startTime: startTime,
            status: AppointmentStatus.Booked,
            amount: finalPrice,
            serviceName: serviceName,
        });

        return newAppointment.save();
    }
    
    async findAppointmentsForUser(userId: string): Promise<AppointmentDocument[]> {
        return this.appointmentModel
            .find({ userId: new Types.ObjectId(userId) }) // <-- FIX: Changed to userId
            .populate('providerId')
            .sort({ appointmentDate: 1, startTime: 1 }) // <-- FIX: Changed appointmentTime to startTime
            .exec();
    }

    async findAppointmentsForProvider(providerId: string): Promise<AppointmentDocument[]> {
        return this.appointmentModel
            .find({ providerId: new Types.ObjectId(providerId) })
            .populate('userId') // <-- FIX: Changed to userId
            .sort({ appointmentDate: 1, startTime: 1 }) // <-- FIX: Changed appointmentTime to startTime
            .exec();
    }

    async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus, providerId: string): Promise<AppointmentDocument> {
        const appointment = await this.appointmentModel.findById(appointmentId);
        if (!appointment) {
            throw new NotFoundException('Appointment not found.');
        }
        if (appointment.providerId.toString() !== providerId) {
            throw new ForbiddenException('You do not have permission to update this appointment.');
        }
        if (appointment.status === AppointmentStatus.Completed || appointment.status === AppointmentStatus.Cancelled) {
            throw new BadRequestException('Cannot change the status of a completed or cancelled appointment.');
        }
        appointment.status = status;
        return appointment.save();
    }

    async cancelAppointment(appointmentId: string, userId: string): Promise<AppointmentDocument> {
        if (!Types.ObjectId.isValid(appointmentId)) {
            throw new BadRequestException('Invalid appointment ID format.');
        }
        const appointment = await this.appointmentModel.findById(appointmentId);
        if (!appointment) {
            throw new NotFoundException(`Appointment with ID "${appointmentId}" not found.`);
        }
        if (appointment.userId.toString() !== userId) { // <-- FIX: Changed to userId
            throw new ForbiddenException('You do not have permission to cancel this appointment.');
        }
        if (appointment.status === AppointmentStatus.Completed || appointment.status === AppointmentStatus.Cancelled) {
            throw new BadRequestException('Appointment cannot be cancelled as it is no longer active.');
        }
        appointment.status = AppointmentStatus.Cancelled;
        return appointment.save();
    }
}