// File: src/appointments/appointments.controller.ts

import { Controller, Get, Post, Body, Param, Request, UseGuards, Patch, HttpCode, HttpStatus, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { DoctorsService } from '../doctors/doctors.service';
import { LabsService } from '../labs/labs.service';
import { HospitalsService } from '../hospitals/hospitals.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProviderJwtAuthGuard } from '../common/guards/provider-jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
    constructor(
        private readonly appointmentsService: AppointmentsService,
        // We keep the other services here because the `create` method might need them later,
        // but the methods causing the error no longer need them.
        private readonly doctorsService: DoctorsService,
        private readonly labsService: LabsService,
        private readonly hospitalsService: HospitalsService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Book a new appointment' })
    @ApiResponse({ status: 201, description: 'Appointment booked successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid provider ID or booking data.' })
    async create(@Request() req, @Body() createAppointmentDto: CreateAppointmentDto) {
        const userId = req.user.sub || req.user._id;
        return this.appointmentsService.createAppointment(userId, createAppointmentDto);
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all appointments for the authenticated user' })
    @ApiResponse({ status: 200, description: 'List of user appointments.' })
    async findForUser(@Request() req) {
        const userId = req.user.sub || req.user._id;
        return this.appointmentsService.findAppointmentsForUser(userId);
    }

    @Get('provider')
    @UseGuards(ProviderJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all appointments for the authenticated provider' })
    @ApiResponse({ status: 200, description: 'List of provider appointments.' })
    async findForProvider(@Request() req) {
        // Corrected logic: The providerId is already available in the token payload
        // after the ProviderJwtAuthGuard has run. No need for extra database calls.
        const providerId = req.user.providerId;
        return this.appointmentsService.findAppointmentsForProvider(providerId);
    }

    @Patch(':id/status')
    @UseGuards(ProviderJwtAuthGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'The ID of the appointment' })
    @ApiOperation({ summary: 'Update the status of an appointment' })
    @ApiResponse({ status: 200, description: 'Appointment status updated successfully.' })
    @ApiResponse({ status: 404, description: 'Appointment not found.' })
    async updateStatus(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto, @Request() req) {
        // Corrected logic: The providerId is already available in the token payload
        // after the ProviderJwtAuthGuard has run. No need for extra database calls.
        const providerId = req.user.providerId;
        return this.appointmentsService.updateAppointmentStatus(id, updateAppointmentDto.status, providerId);
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'The ID of the appointment to cancel' })
    @ApiOperation({ summary: 'Cancel an appointment as a user' })
    @ApiResponse({ status: 200, description: 'Appointment cancelled successfully.' })
    @ApiResponse({ status: 404, description: 'Appointment not found.' })
    @ApiResponse({ status: 403, description: 'Forbidden: You do not have permission to cancel this appointment.' })
    async cancelAppointment(@Param('id') appointmentId: string, @Request() req) {
        const userId = req.user.sub || req.user._id;
        return this.appointmentsService.cancelAppointment(appointmentId, userId);
    }
}