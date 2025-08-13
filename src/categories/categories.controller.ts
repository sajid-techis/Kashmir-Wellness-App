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
  UseGuards, // <-- Import UseGuards
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // <-- Import JwtAuthGuard
import { RolesGuard } from '../common/guards/roles.guard'; // <-- IMPORT RolesGuard
import { Roles } from '../common/decorators/roles.decorator'; // <-- IMPORT Roles decorator
import { Role } from '../common/enums/role.enum'; // <-- IMPORT Role enum

@Controller('categories')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at method level
  @Roles(Role.Admin) // Only Admins can create categories
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  // Anyone (even unauthenticated) can view all categories
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  // Anyone (even unauthenticated) can view a single category
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return category;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at method level
  @Roles(Role.Admin) // Only Admins can update categories
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const updatedCategory = await this.categoriesService.update(id, updateCategoryDto);
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return updatedCategory;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at method level
  @Roles(Role.Admin) // Only Admins can delete categories
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const deletedCategory = await this.categoriesService.remove(id);
    if (!deletedCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
  }
}