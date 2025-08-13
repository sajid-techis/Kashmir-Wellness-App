// File: kashmir-wellness-backend/src/hospitals/hospitals.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, ParseFloatPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { HospitalServiceDto, CreateHospitalAvailabilityDto } from './dto/availability.dto'; // <-- NEW IMPORTS
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';


@ApiTags('Hospitals')
@Controller('hospitals')
export class HospitalsController {
    constructor(private readonly hospitalsService: HospitalsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new hospital profile' })
    @ApiBearerAuth()
    @ApiResponse({ status: 403, description: 'Forbidden resource' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async create(@Body() createHospitalDto: CreateHospitalDto) {
        return this.hospitalsService.create(createHospitalDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all hospital profiles' })
    @ApiResponse({ status: 200, description: 'Returns all hospital profiles.' })
    async findAll() {
        return this.hospitalsService.findAll();
    }

    @Get('near')
    @ApiOperation({ summary: 'Find hospitals near a specified location' })
    @ApiQuery({ name: 'longitude', description: 'User\'s current longitude', example: 74.7973 })
    @ApiQuery({ name: 'latitude', description: 'User\'s current latitude', example: 34.0837 })
    @ApiQuery({ name: 'maxDistanceKm', description: 'Maximum distance in kilometers', required: false, example: 10 })
    @ApiResponse({ status: 200, description: 'Returns hospitals found near the given coordinates.' })
    async findHospitalsNear(
        @Query('longitude', ParseFloatPipe) longitude: number,
        @Query('latitude', ParseFloatPipe) latitude: number,
        @Query('maxDistanceKm') maxDistanceKm: string
    ) {
        if (longitude === undefined || latitude === undefined) {
            throw new BadRequestException('Longitude and latitude are required.');
        }
        const distance = maxDistanceKm ? parseFloat(maxDistanceKm) : 10;
        return this.hospitalsService.findHospitalsNear(longitude, latitude, distance);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a hospital profile by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the hospital', type: 'string' })
    @ApiResponse({ status: 200, description: 'Returns the hospital profile.' })
    async findOne(@Param('id') id: string) {
        return this.hospitalsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a hospital profile by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the hospital', type: 'string' })
    @ApiBearerAuth()
    @ApiResponse({ status: 403, description: 'Forbidden resource' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async update(@Param('id') id: string, @Body() updateHospitalDto: UpdateHospitalDto) {
        return this.hospitalsService.update(id, updateHospitalDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a hospital profile by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the hospital', type: 'string' })
    @ApiBearerAuth()
    @ApiResponse({ status: 403, description: 'Forbidden resource' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async remove(@Param('id') id: string) {
        await this.hospitalsService.remove(id);
    }

    // NEW ENDPOINTS FOR SERVICES AND AVAILABILITY
    @Patch(':id/services')
    @ApiOperation({ summary: 'Update a hospital\'s list of services/departments' })
    @ApiParam({ name: 'id', description: 'The ID of the hospital', type: 'string' })
    @ApiBody({ type: [HospitalServiceDto] })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.HospitalAdmin)
    async updateServices(@Param('id') id: string, @Body() services: HospitalServiceDto[]) {
        return this.hospitalsService.updateServices(id, services);
    }

    @Get(':id/services')
    @ApiOperation({ summary: 'Get a hospital\'s list of services/departments' })
    @ApiParam({ name: 'id', description: 'The ID of the hospital', type: 'string' })
    async getServices(@Param('id') id: string) {
        return this.hospitalsService.getServices(id);
    }

    @Patch(':id/availability')
    @ApiOperation({ summary: 'Set or update a hospital\'s availability schedule' })
    @ApiParam({ name: 'id', description: 'The ID of the hospital', type: 'string' })
    @ApiBody({ type: CreateHospitalAvailabilityDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.HospitalAdmin)
    async setAvailability(@Param('id') id: string, @Body() availabilityDto: CreateHospitalAvailabilityDto) {
        return this.hospitalsService.setAvailability(id, availabilityDto);
    }

    @Get(':id/availability')
    @ApiOperation({ summary: 'Get a hospital\'s availability schedule by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the hospital', type: 'string' })
    async getAvailability(@Param('id') id: string) {
        return this.hospitalsService.getAvailability(id);
    }
}