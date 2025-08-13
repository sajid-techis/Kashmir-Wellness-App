// File: kashmir-wellness-backend/src/labs/labs.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, ParseFloatPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { LabsService } from './labs.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { LabServiceDto, CreateLabAvailabilityDto } from './dto/availability.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';


@ApiTags('Labs')
@Controller('labs')
export class LabsController {
    constructor(private readonly labsService: LabsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new lab profile' })
    @ApiBearerAuth()
    @ApiResponse({ status: 403, description: 'Forbidden resource' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async create(@Body() createLabDto: CreateLabDto) {
        return this.labsService.create(createLabDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all lab profiles' })
    @ApiResponse({ status: 200, description: 'Returns all lab profiles.' })
    async findAll() {
        return this.labsService.findAll();
    }

    @Get('near')
    @ApiOperation({ summary: 'Find labs near a specified location' })
    @ApiQuery({ name: 'longitude', description: 'User\'s current longitude', example: 74.7977 })
    @ApiQuery({ name: 'latitude', description: 'User\'s current latitude', example: 34.0836 })
    @ApiQuery({ name: 'maxDistanceKm', description: 'Maximum distance in kilometers', required: false, example: 10 })
    @ApiResponse({ status: 200, description: 'Returns labs found near the given coordinates.' })
    async findLabsNear(
        @Query('longitude', ParseFloatPipe) longitude: number,
        @Query('latitude', ParseFloatPipe) latitude: number,
        @Query('maxDistanceKm') maxDistanceKm: string
    ) {
        if (longitude === undefined || latitude === undefined) {
            throw new BadRequestException('Longitude and latitude are required.');
        }
        const distance = maxDistanceKm ? parseFloat(maxDistanceKm) : 10;
        return this.labsService.findLabsNear(longitude, latitude, distance);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a lab profile by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the lab', type: 'string' })
    @ApiResponse({ status: 200, description: 'Returns the lab profile.' })
    async findOne(@Param('id') id: string) {
        return this.labsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a lab profile by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the lab', type: 'string' })
    @ApiBearerAuth()
    @ApiResponse({ status: 403, description: 'Forbidden resource' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async update(@Param('id') id: string, @Body() updateLabDto: UpdateLabDto) {
        return this.labsService.update(id, updateLabDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a lab profile by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the lab', type: 'string' })
    @ApiBearerAuth()
    @ApiResponse({ status: 403, description: 'Forbidden resource' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async remove(@Param('id') id: string) {
        return this.labsService.remove(id);
    }

    // NEW ENDPOINTS FOR SERVICES AND AVAILABILITY
    @Patch(':id/services')
    @ApiOperation({ summary: 'Update a lab\'s list of services' })
    @ApiParam({ name: 'id', description: 'The ID of the lab', type: 'string' })
    @ApiBody({ type: [LabServiceDto] })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.LabAdmin)
    async updateServices(@Param('id') id: string, @Body() services: LabServiceDto[]) {
        return this.labsService.updateServices(id, services);
    }

    @Get(':id/services')
    @ApiOperation({ summary: 'Get a lab\'s list of services' })
    @ApiParam({ name: 'id', description: 'The ID of the lab', type: 'string' })
    async getServices(@Param('id') id: string) {
        return this.labsService.getServices(id);
    }

    @Patch(':id/availability')
    @ApiOperation({ summary: 'Set or update a lab\'s availability schedule' })
    @ApiParam({ name: 'id', description: 'The ID of the lab', type: 'string' })
    @ApiBody({ type: CreateLabAvailabilityDto })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.LabAdmin)
    async setAvailability(@Param('id') id: string, @Body() availabilityDto: CreateLabAvailabilityDto) {
        return this.labsService.setAvailability(id, availabilityDto);
    }

    @Get(':id/availability')
    @ApiOperation({ summary: 'Get a lab\'s availability schedule by ID' })
    @ApiParam({ name: 'id', description: 'The ID of the lab', type: 'string' })
    async getAvailability(@Param('id') id: string) {
        return this.labsService.getAvailability(id);
    }
}