import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/products-entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.product.images'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        total: 0,
        itemCount: 0,
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);
    return this.formatCartResponse(cart);
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    const { productId, quantity, notes } = addToCartDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isAvailable) {
      throw new BadRequestException('Product is not available');
    }

    if (product.quantity < quantity) {
      throw new BadRequestException(
        `Only ${product.quantity} units available in stock`,
      );
    }

    if (quantity < product.minOrderQuantity) {
      throw new BadRequestException(
        `Minimum order quantity is ${product.minOrderQuantity}`,
      );
    }

    if (product.maxOrderQuantity && quantity > product.maxOrderQuantity) {
      throw new BadRequestException(
        `Maximum order quantity is ${product.maxOrderQuantity}`,
      );
    }

    const cart = await this.getOrCreateCart(userId);

    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;

      if (newQuantity > product.quantity) {
        throw new BadRequestException(
          `Cannot add more. Only ${product.quantity} units available`,
        );
      }

      if (product.maxOrderQuantity && newQuantity > product.maxOrderQuantity) {
        throw new BadRequestException(
          `Maximum order quantity is ${product.maxOrderQuantity}`,
        );
      }

      cartItem.quantity = newQuantity;
      cartItem.subtotal = parseFloat(
        (newQuantity * parseFloat(product.price.toString())).toFixed(2),
      );
      if (notes) {
        cartItem.notes = notes;
      }
      await this.cartItemRepository.save(cartItem);
    } else {
      const unitPrice = parseFloat(product.price.toString());
      const subtotal = parseFloat((quantity * unitPrice).toFixed(2));

      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        unitPrice,
        subtotal,
        notes,
      });
      await this.cartItemRepository.save(cartItem);
    }

    cart.lastActivityAt = new Date();
    await this.recalculateCart(cart.id);

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (updateCartItemDto.quantity !== undefined) {
      const { quantity } = updateCartItemDto;
      const product = cartItem.product;

      if (quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }

      if (quantity > product.quantity) {
        throw new BadRequestException(
          `Only ${product.quantity} units available in stock`,
        );
      }

      if (quantity < product.minOrderQuantity) {
        throw new BadRequestException(
          `Minimum order quantity is ${product.minOrderQuantity}`,
        );
      }

      if (product.maxOrderQuantity && quantity > product.maxOrderQuantity) {
        throw new BadRequestException(
          `Maximum order quantity is ${product.maxOrderQuantity}`,
        );
      }

      cartItem.quantity = quantity;
      cartItem.subtotal = parseFloat(
        (quantity * parseFloat(product.price.toString())).toFixed(2),
      );
    }

    if (updateCartItemDto.notes !== undefined) {
      cartItem.notes = updateCartItemDto.notes;
    }

    await this.cartItemRepository.save(cartItem);

    cart.lastActivityAt = new Date();
    await this.recalculateCart(cart.id);

    return this.getCart(userId);
  }

  async removeFromCart(
    userId: string,
    cartItemId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    cart.lastActivityAt = new Date();
    await this.recalculateCart(cart.id);

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);

    await this.cartItemRepository.delete({ cartId: cart.id });

    cart.subtotal = 0;
    cart.tax = 0;
    cart.shippingCost = 0;
    cart.total = 0;
    cart.itemCount = 0;
    cart.lastActivityAt = new Date();

    await this.cartRepository.save(cart);
  }

  async removeUnavailableItems(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    for (const item of cart.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product || !product.isAvailable || product.quantity < item.quantity) {
        await this.cartItemRepository.remove(item);
      }
    }

    await this.recalculateCart(cart.id);

    return this.getCart(userId);
  }

  private async recalculateCart(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      subtotal += parseFloat(item.subtotal.toString());
      itemCount += item.quantity;
    }

    const tax = parseFloat((subtotal * 0.0).toFixed(2));
    const shippingCost = 0;
    const total = parseFloat((subtotal + tax + shippingCost).toFixed(2));

    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.shippingCost = shippingCost;
    cart.total = total;
    cart.itemCount = itemCount;

    await this.cartRepository.save(cart);
  }

  private formatCartResponse(cart: Cart): CartResponseDto {
    const items: CartItemResponseDto[] = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice.toString()),
      subtotal: parseFloat(item.subtotal.toString()),
      notes: item.notes,
      productImage:
        item.product.images && item.product.images.length > 0
          ? item.product.images[0].url
          : undefined,
      isAvailable: item.product.isAvailable,
      availableQuantity: item.product.quantity,
    }));

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      subtotal: parseFloat(cart.subtotal.toString()),
      tax: parseFloat(cart.tax.toString()),
      shippingCost: parseFloat(cart.shippingCost.toString()),
      total: parseFloat(cart.total.toString()),
      itemCount: cart.itemCount,
      lastActivityAt: cart.lastActivityAt,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async validateCartOwnership(userId: string, cartId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.userId !== userId) {
      throw new ForbiddenException('You can only access your own cart');
    }

    return cart;
  }
}
