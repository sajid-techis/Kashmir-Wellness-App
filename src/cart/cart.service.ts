// File: kashmir-wellness-backend/src/cart/cart.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument, CartItem } from '../schemas/cart.schema';
import { Product, ProductDocument } from '../schemas/product.schema'; // Import Product document
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>, // Inject Product Model
  ) {}

  async getCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!cart) {
      // If no cart exists, create an empty one
      cart = await this.cartModel.create({ userId: new Types.ObjectId(userId), items: [], totalAmount: 0 });
    }
    return cart;
  }

  async addItemToCart(userId: string, addCartItemDto: AddCartItemDto): Promise<CartDocument> {
    const { productId, quantity } = addCartItemDto;
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);

    // 1. Find the product to get its details (price, name, image)
    const product = await this.productModel.findById(productObjectId).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found.`);
    }
    if (product.stock < quantity) {
      throw new BadRequestException(`Not enough stock for product "${product.name}". Available: ${product.stock}`);
    }

    // 2. Find or create the user's cart
    let cart = await this.cartModel.findOne({ userId: userObjectId }).exec();

    if (!cart) {
      cart = new this.cartModel({ userId: userObjectId, items: [], totalAmount: 0 });
    }

    // 3. Check if the item already exists in the cart
    const existingItemIndex = cart.items.findIndex(item => item.productId.equals(productObjectId));

    if (existingItemIndex > -1) {
      // Item exists, update quantity
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Adding ${quantity} more units would exceed available stock for "${product.name}". Total requested: ${newQuantity}, Available: ${product.stock}`);
      }
      existingItem.quantity = newQuantity;
      existingItem.price = product.price; // Update price in case it changed
      // Note: `name` and `imageUrl` are denormalized, if they can change, you might update them here too.
      // For simplicity, let's update them on add/update
      existingItem.name = product.name;
      existingItem.imageUrl = product.images[0]; // Get the first image URL
    } else {
      // Item does not exist, add new item
      const newItem: CartItem = {
        productId: productObjectId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.images[0], // Get the first image URL
      };
      cart.items.push(newItem);
    }

    // The pre-save/pre-findOneAndUpdate hook in the schema will calculate totalAmount
    return await cart.save();
  }

  async updateCartItemQuantity(userId: string, productId: string, updateCartItemDto: UpdateCartItemDto): Promise<CartDocument> {
    const { quantity } = updateCartItemDto;
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);

    const cart = await this.cartModel.findOne({ userId: userObjectId }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    const itemIndex = cart.items.findIndex(item => item.productId.equals(productObjectId));
    if (itemIndex === -1) {
      throw new NotFoundException(`Product with ID "${productId}" not found in cart.`);
    }

    const product = await this.productModel.findById(productObjectId).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" (in cart) not found in products collection.`);
    }
    if (product.stock < quantity) {
      throw new BadRequestException(`Not enough stock for product "${product.name}". Available: ${product.stock}, Requested: ${quantity}`);
    }

    cart.items[itemIndex].quantity = quantity;
    // Update price in case it changed
    cart.items[itemIndex].price = product.price;
    cart.items[itemIndex].name = product.name;
    cart.items[itemIndex].imageUrl = product.images[0]; // Get the first image URL


    // Mark items array as modified so Mongoose runs pre-save hook for nested changes
    cart.markModified('items');
    return await cart.save();
  }

  async removeCartItem(userId: string, productId: string): Promise<CartDocument> {
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);

    const cart = await this.cartModel.findOne({ userId: userObjectId }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(item => !item.productId.equals(productObjectId));

    if (cart.items.length === initialItemCount) {
      throw new NotFoundException(`Product with ID "${productId}" not found in cart.`);
    }

    cart.markModified('items');
    return await cart.save();
  }

  async clearCart(userId: string): Promise<CartDocument> {
    const userObjectId = new Types.ObjectId(userId);

    const cart = await this.cartModel.findOne({ userId: userObjectId }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    cart.items = [];
    cart.markModified('items');
    return await cart.save();
  }
}