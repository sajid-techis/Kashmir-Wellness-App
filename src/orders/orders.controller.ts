import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    NotFoundException,
    UnauthorizedException,
    Patch,
    Delete,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { UpdatePrescriptionStatusDto } from './dto/update-prescription-status.dto'; // NEW IMPORT
import { Types } from 'mongoose';
import { OrderStatus, PrescriptionStatus } from '../schemas/order.schema'; // NEW IMPORT

// Extend Request to include the user property from JwtAuthGuard
interface AuthenticatedRequest extends Request {
    user: {
        _id: string;
        email: string;
        role: string;
    };
}

@Controller('orders')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    // Existing create endpoint for direct order creation (e.g., admin)
    @Post()
    @Roles(Role.User, Role.Admin)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrderDto: CreateOrderDto, @Request() req: AuthenticatedRequest) {
        const userId = new Types.ObjectId(req.user._id);
        console.log(`OrdersController - create: Creating order for user ID: ${req.user._id}`);
        return this.ordersService.create(createOrderDto, userId);
    }

    /**
     * Endpoint for users to checkout their shopping cart and create an order.
     * This will clear the cart and decrement product stock.
     * MODIFIED to handle prescriptionUrl.
     */
    @Post('checkout')
    @Roles(Role.User)
    @HttpCode(HttpStatus.CREATED)
    async checkout(@Body() checkoutOrderDto: CheckoutOrderDto, @Request() req: AuthenticatedRequest) {
        const userId = new Types.ObjectId(req.user._id);
        console.log(`OrdersController - checkout: User ${userId.toString()} initiating checkout.`);
        return this.ordersService.createOrderFromCart(userId, checkoutOrderDto, checkoutOrderDto.prescriptionUrl);
    }

    // NEW ENDPOINT: Admin reviews a prescription
    @Patch(':id/prescription')
    @Roles(Role.Admin) // Or a specific pharmacist role if you have one
    @HttpCode(HttpStatus.OK)
    async updatePrescriptionStatus(@Param('id') orderId: string, @Body() updateDto: UpdatePrescriptionStatusDto, @Request() req: AuthenticatedRequest) {
        const adminId = new Types.ObjectId(req.user._id);
        const order = await this.ordersService.updatePrescriptionStatus(orderId, updateDto.status, adminId);
        if (!order) {
            throw new NotFoundException(`Order with ID "${orderId}" not found or status could not be updated.`);
        }
        return order;
    }

    // Existing findAll, findMyOrders, findOne, update, remove methods
    @Get()
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.OK)
    async findAll(@Request() req: AuthenticatedRequest) {
        return this.ordersService.findAll();
    }

    @Get('my')
    @Roles(Role.User, Role.Admin)
    @HttpCode(HttpStatus.OK)
    async findMyOrders(@Request() req: AuthenticatedRequest) {
        return this.ordersService.findUserOrders(new Types.ObjectId(req.user._id));
    }

    @Get(':id')
    @Roles(Role.User, Role.Admin)
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
        const order = await this.ordersService.findOne(id);
        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found.`);
        }
        if (req.user.role !== Role.Admin && order.userId.toString() !== req.user._id.toString()) {
            throw new UnauthorizedException('You are not authorized to view this order.');
        }
        return order;
    }

    @Patch(':id')
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        const updatedOrder = await this.ordersService.update(id, updateOrderDto);
        if (!updatedOrder) {
            throw new NotFoundException(`Order with ID "${id}" not found.`);
        }
        return updatedOrder;
    }

    @Delete(':id')
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string) {
        const removedOrder = await this.ordersService.remove(id);
        if (!removedOrder) {
            throw new NotFoundException(`Order with ID "${id}" not found.`);
        }
        return { message: `Order with ID "${id}" successfully deleted.` };
    }
}