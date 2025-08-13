import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// All properties of CreateProductDto become optional for updates
export class UpdateProductDto extends PartialType(CreateProductDto) {}