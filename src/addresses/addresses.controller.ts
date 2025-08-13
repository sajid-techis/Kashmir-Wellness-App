import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @Roles(Role.User)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAddressDto: CreateAddressDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user._id;
    return await this.addressesService.create(createAddressDto, userId);
  }

  @Get()
  @Roles(Role.User)
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user._id;
    return await this.addressesService.findAllByUser(userId);
  }

  @Get(':id')
  @Roles(Role.User)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user._id;
    const address = await this.addressesService.findOneById(id, userId);
    if (!address) {
      throw new NotFoundException(`Address with ID "${id}" not found or not owned by you.`);
    }
    return address;
  }

  @Patch(':id')
  @Roles(Role.User)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user._id;
    const updatedAddress = await this.addressesService.update(id, updateAddressDto, userId);
    if (!updatedAddress) {
      throw new NotFoundException(`Address with ID "${id}" not found or not owned by you.`);
    }
    return updatedAddress;
  }

  @Delete(':id')
  @Roles(Role.User)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user._id;
    const deletedAddress = await this.addressesService.remove(id, userId);
    if (!deletedAddress) {
      throw new NotFoundException(`Address with ID "${id}" not found.`);
    }
  }
}