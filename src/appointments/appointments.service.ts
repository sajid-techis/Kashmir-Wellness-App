// File: kashmir-wellness-backend/src/appointments/appointments.service.ts

import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus, AppointmentType } from '../schemas/appointment.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Doctor, DoctorDocument } from '../schemas/doctor.schema';
import { Lab, LabDocument } from '../schemas/lab.schema';
import { Hospital, HospitalDocument } from '../schemas/hospital.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import  dayjs from 'dayjs';
import  isBetween from 'dayjs/plugin/isBetween';
import  customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        @InjectModel(Lab.name) private labModel: Model<LabDocument>,
        @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    ) { }

    async createAppointment(userId: string, createAppointmentDto: CreateAppointmentDto): Promise<AppointmentDocument> {
        const { providerId, providerModel, appointmentDate, appointmentTime, serviceName } = createAppointmentDto;

        const provider = await this.getAndValidateProvider(providerId, providerModel);

        const { fee } = this.validateService(provider, serviceName, providerModel);

        const appointmentDateTime = dayjs(`${appointmentDate} ${appointmentTime}`, 'YYYY-MM-DD HH:mm');
        this.validateAvailability(provider, appointmentDateTime, appointmentDate, appointmentTime);

        await this.checkForConflicts(providerId, appointmentDate, appointmentTime);

        // Remove providerId from createAppointmentDto before spreading
        const { providerId: _providerId, ...restDto } = createAppointmentDto;
        const newAppointment = new this.appointmentModel({
            userId,
            providerId: new Types.ObjectId(providerId),
            ...restDto,
            fee,
            status: AppointmentStatus.Pending,
        });

        return newAppointment.save();
    }

    // Removed duplicate findAppointmentsForUser method

    private async getAndValidateProvider(providerId: string, providerModel: string): Promise<DoctorDocument | LabDocument | HospitalDocument> {
        let provider: DoctorDocument | LabDocument | HospitalDocument | null;
        switch (providerModel) {
            case Doctor.name:
                provider = await this.doctorModel.findById(providerId).exec();
                break;
            case Lab.name:
                provider = await this.labModel.findById(providerId).exec();
                break;
            case Hospital.name:
                provider = await this.hospitalModel.findById(providerId).exec();
                break;
            default:
                throw new BadRequestException('Invalid provider model specified.');
        }

        if (!provider) {
            throw new NotFoundException(`${providerModel} with ID "${providerId}" not found.`);
        }
        return provider;
    }

    private validateService(provider: DoctorDocument | LabDocument | HospitalDocument, serviceName: string, providerModel: string): { fee: number } {
        if (!('services' in provider) || !('availability' in provider)) {
            throw new BadRequestException('Provider data is incomplete. Services or availability not found.');
        }

        const requestedService = provider.services.find(service => service.name === serviceName);
        if (!requestedService) {
            throw new BadRequestException(`Service "${serviceName}" not offered by this ${providerModel}.`);
        }
        return { fee: requestedService.price };
    }

    private validateAvailability(provider: DoctorDocument | LabDocument | HospitalDocument, appointmentDateTime: dayjs.Dayjs, appointmentDate: string, appointmentTime: string): void {
        const { availability } = provider;
        if (!availability || !availability.slots || availability.slots.length === 0) {
            throw new BadRequestException('Provider has no availability schedule set.');
        }

        if (!appointmentDateTime.isValid()) {
            throw new BadRequestException('Invalid appointment date or time format.');
        }

        const appointmentDayStart = dayjs(appointmentDate).startOf('day');
        const isUnavailable = availability.unavailableDates.some(
            unavailableDate => dayjs(unavailableDate.toString()).isSame(appointmentDayStart, 'day')
        );
        if (isUnavailable) {
            throw new BadRequestException(`Provider is unavailable on ${appointmentDate}.`);
        }

        const requestedDayOfWeek = appointmentDateTime.format('dddd');
        const daySlot = availability.slots.find(slot => slot.dayOfWeek === requestedDayOfWeek);
        if (!daySlot) {
            throw new BadRequestException(`Provider is not available on ${requestedDayOfWeek}s.`);
        }

        const startTime = dayjs(`${appointmentDate} ${daySlot.startTime}`, 'YYYY-MM-DD HH:mm');
        const endTime = dayjs(`${appointmentDate} ${daySlot.endTime}`, 'YYYY-MM-DD HH:mm');

        if (!appointmentDateTime.isBetween(startTime, endTime, null, '[)')) {
            throw new BadRequestException(`Appointment time ${appointmentTime} is outside of the provider's working hours (${daySlot.startTime}-${daySlot.endTime}).`);
        }

        const minutesSinceStart = appointmentDateTime.diff(startTime, 'minute');
        if (minutesSinceStart % availability.slotDurationMinutes !== 0) {
            throw new BadRequestException(`Appointment time must be a valid slot. Slots are available every ${availability.slotDurationMinutes} minutes.`);
        }
    }

    private async checkForConflicts(providerId: string, appointmentDate: string, appointmentTime: string): Promise<void> {
        const existingAppointment = await this.appointmentModel.findOne({
            providerId: new Types.ObjectId(providerId),
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,
            status: { $ne: AppointmentStatus.Cancelled },
        });

        if (existingAppointment) {
            throw new BadRequestException('This time slot is already booked.');
        }
    }

    async findAppointmentsForUser(userId: string): Promise<AppointmentDocument[]> {
        return this.appointmentModel
            .find({ userId: new Types.ObjectId(userId) })
            .populate('providerId')
            .sort({ appointmentDate: 1, appointmentTime: 1 })
            .exec();
    }

    async findAppointmentsForProvider(providerId: string): Promise<AppointmentDocument[]> {
        return this.appointmentModel
            .find({ providerId: new Types.ObjectId(providerId) })
            .populate('userId')
            .sort({ appointmentDate: 1, appointmentTime: 1 })
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

        if (appointment.userId.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to cancel this appointment.');
        }

        if (appointment.status === AppointmentStatus.Completed || appointment.status === AppointmentStatus.Cancelled) {
            throw new BadRequestException('Appointment cannot be cancelled as it is no longer active.');
        }

        appointment.status = AppointmentStatus.Cancelled;
        return appointment.save();
    }
}