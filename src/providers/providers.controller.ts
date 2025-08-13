// File: kashmir-wellness-backend/src/providers/providers.controller.ts

import { Controller, Get, Request, UseGuards, Patch, Body, Query, Param, NotFoundException } from '@nestjs/common';
import { ProviderJwtAuthGuard } from '../common/guards/provider-jwt-auth.guard';
import { ProvidersService } from './providers.service';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProviderType } from './dto/provider-filter.dto';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'Find all providers, with optional filters for type and search query' })
  @ApiQuery({ name: 'type', required: false, enum: ProviderType })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.providersService.findAll(type, search);
  }

  // --- THIS IS THE ENDPOINT WE ARE FIXING ---
  @Get(':providerModel/:providerId')
  @ApiOperation({ summary: 'Get a specific provider profile by its ID and model type' })
  @ApiParam({ name: 'providerModel', enum: ['doctor', 'lab', 'hospital'], description: 'The type of the provider (lowercase)' })
  @ApiParam({ name: 'providerId', type: String, description: 'The ID of the provider' })
  @ApiResponse({ status: 200, description: 'Provider profile retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  async getProviderById(
    @Param('providerModel') providerModel: string,
    @Param('providerId') providerId: string,
  ) {
    // This reuses the logic you already wrote in your service, which is efficient.
    return this.providersService.getProviderProfile(providerId, providerModel);
  }
  // --- END OF ENDPOINT ---

  @ApiBearerAuth()
  @UseGuards(ProviderJwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get the profile of the authenticated provider' })
  getProfile(@Request() req) {
    const { providerId, providerModel } = req.user;
    return this.providersService.getProviderProfile(providerId, providerModel);
  }

  @ApiBearerAuth()
  @UseGuards(ProviderJwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update the profile of the authenticated provider' })
  updateProfile(@Request() req, @Body() updateProviderDto: UpdateProviderDto) {
    const { providerId, providerModel } = req.user;
    return this.providersService.updateProviderProfile(providerId, providerModel, updateProviderDto);
  }
}