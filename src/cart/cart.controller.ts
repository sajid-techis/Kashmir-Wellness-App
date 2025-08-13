// File: kashmir-wellness-backend/src/cart/cart.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Adjust path
import { RolesGuard } from '../common/guards/roles.guard'; // Adjust path
import { Roles } from '../common/decorators/roles.decorator'; // Adjust path
import { Role } from '../common/enums/role.enum'; // Adjust path
import { Request } from 'express'; // Import Request from express

// Extend Request to include the user property from JwtAuthGuard
interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all cart routes
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Apply validation globally to controller
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Roles(Role.User) // Only logged-in users can view their own cart
  @HttpCode(HttpStatus.OK)
  async getCart(@Req() req: AuthenticatedRequest) {
    return await this.cartService.getCart(req.user._id);
  }

  @Post('add')
  @Roles(Role.User) // Only logged-in users can add items to cart
  @HttpCode(HttpStatus.OK) // Use OK because it's often an update operation
  async addItemToCart(@Req() req: AuthenticatedRequest, @Body() addCartItemDto: AddCartItemDto) {
    return await this.cartService.addItemToCart(req.user._id, addCartItemDto);
  }

  @Patch('update/:productId')
  @Roles(Role.User) // Only logged-in users can update item quantity
  @HttpCode(HttpStatus.OK)
  async updateCartItemQuantity(
    @Req() req: AuthenticatedRequest,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateCartItemQuantity(req.user._id, productId, updateCartItemDto);
  }

  @Delete('remove/:productId')
  @Roles(Role.User) // Only logged-in users can remove items
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async removeCartItem(@Req() req: AuthenticatedRequest, @Param('productId') productId: string) {
    await this.cartService.removeCartItem(req.user._id, productId);
    // No content to return for 204
  }

  @Delete('clear')
  @Roles(Role.User) // Only logged-in users can clear their cart
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async clearCart(@Req() req: AuthenticatedRequest) {
    await this.cartService.clearCart(req.user._id);
    // No content to return for 204
  }
}