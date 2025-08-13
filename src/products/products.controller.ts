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
  UseGuards,Query
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // <-- Import JwtAuthGuard
import { RolesGuard } from '../common/guards/roles.guard'; // <-- IMPORT RolesGuard
import { Roles } from '../common/decorators/roles.decorator'; // <-- IMPORT Roles decorator
import { Role } from '../common/enums/role.enum'; // <-- IMPORT Role enum
import { ApiQuery,ApiOperation } from '@nestjs/swagger';

@Controller('products')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at method level for creation
  @Roles(Role.Admin) // Only Admins can create products
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

 @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all products, optionally filtered by category' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter products by a category ID' })
  async findAll(@Query('categoryId') categoryId?: string) {
    return await this.productsService.findAll(categoryId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  // Anyone (even unauthenticated) can view a single product
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }
    return product;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at method level for update
  @Roles(Role.Admin) // Only Admins can update products
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const updatedProduct = await this.productsService.update(id, updateProductDto);
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }
    return updatedProduct;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at method level for deletion
  @Roles(Role.Admin) // Only Admins can delete products
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const deletedProduct = await this.productsService.remove(id);
    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }
  }
}