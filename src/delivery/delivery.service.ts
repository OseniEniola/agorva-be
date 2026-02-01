import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryProvider, DeliveryStatus } from './entities/delivery.entity';
import { UberDirectService } from './uber-direct.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { DeliveryQuoteRequestDto } from './dto/delivery-quote.dto';
import { DeliveryResponseDto } from './dto/delivery-response.dto';
import {
  UberDirectDeliveryRequest,
  UberDirectWebhookEvent,
} from './interfaces/uber-direct.interface';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    private uberDirectService: UberDirectService,
  ) {}

  async createDelivery(
    customerId: string,
    createDeliveryDto: CreateDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    const {
      orderId,
      sellerId,
      provider,
      pickupAddress,
      pickupContact,
      pickupNotes,
      dropoffAddress,
      dropoffContact,
      dropoffNotes,
      items,
      signatureRequired,
      proofOfDeliveryRequired,
      scheduledPickupTime,
      scheduledDropoffTime,
    } = createDeliveryDto;

    let delivery = this.deliveryRepository.create({
      orderId,
      customerId,
      sellerId,
      provider,
      pickupAddress,
      pickupContact,
      pickupNotes,
      dropoffAddress,
      dropoffContact,
      dropoffNotes,
      items,
      signatureRequired: signatureRequired || false,
      proofOfDeliveryRequired: proofOfDeliveryRequired || false,
      scheduledPickupTime: scheduledPickupTime
        ? new Date(scheduledPickupTime)
        : undefined,
      scheduledDropoffTime: scheduledDropoffTime
        ? new Date(scheduledDropoffTime)
        : undefined,
      status: DeliveryStatus.PENDING,
    });

    delivery = await this.deliveryRepository.save(delivery);

    if (provider === DeliveryProvider.UBER_DIRECT) {
      try {
        const uberRequest: UberDirectDeliveryRequest = {
          pickup: {
            location: {
              address: pickupAddress.street,
              city: pickupAddress.city,
              state: pickupAddress.state,
              zip_code: pickupAddress.zipCode,
              country: pickupAddress.country,
              latitude: pickupAddress.latitude,
              longitude: pickupAddress.longitude,
            },
            contact: {
              first_name: pickupContact.firstName,
              last_name: pickupContact.lastName,
              phone_number: pickupContact.phoneNumber,
              email: pickupContact.email,
              company_name: pickupContact.companyName,
              send_notifications: true,
            },
            notes: pickupNotes,
            ready_dt: scheduledPickupTime,
          },
          dropoff: {
            location: {
              address: dropoffAddress.street,
              city: dropoffAddress.city,
              state: dropoffAddress.state,
              zip_code: dropoffAddress.zipCode,
              country: dropoffAddress.country,
              latitude: dropoffAddress.latitude,
              longitude: dropoffAddress.longitude,
            },
            contact: {
              first_name: dropoffContact.firstName,
              last_name: dropoffContact.lastName,
              phone_number: dropoffContact.phoneNumber,
              email: dropoffContact.email,
              send_notifications: true,
            },
            notes: dropoffNotes,
            deadline_dt: scheduledDropoffTime,
            signature_required: signatureRequired,
            proof_of_delivery_photo_required: proofOfDeliveryRequired,
          },
          items: items.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            currency_code: 'USD',
          })),
          manifest_reference: delivery.id,
          external_store_id: sellerId,
          undeliverable_action: 'return',
        };

        const uberDelivery = await this.uberDirectService.createDelivery(uberRequest);

        delivery.externalDeliveryId = uberDelivery.id;
        delivery.status = DeliveryStatus.SCHEDULED;
        delivery.deliveryFee = uberDelivery.fee;
        delivery.currencyCode = uberDelivery.currency;
        delivery.trackingUrl = uberDelivery.tracking_url;
        delivery.pickupEta = uberDelivery.pickup_eta
          ? new Date(uberDelivery.pickup_eta)
          : undefined;
        delivery.dropoffEta = uberDelivery.dropoff_eta
          ? new Date(uberDelivery.dropoff_eta)
          : undefined;

        await this.deliveryRepository.save(delivery);
      } catch (error) {
        this.logger.error('Failed to create Uber Direct delivery:', error);
        delivery.status = DeliveryStatus.FAILED;
        delivery.failureReason = error.message;
        await this.deliveryRepository.save(delivery);
        throw error;
      }
    }

    return this.formatDeliveryResponse(delivery);
  }

  async getQuote(quoteRequest: DeliveryQuoteRequestDto) {
    try {
      const quote = await this.uberDirectService.getQuote({
        pickup_address: quoteRequest.pickupAddress,
        dropoff_address: quoteRequest.dropoffAddress,
        pickup_latitude: quoteRequest.pickupLatitude,
        pickup_longitude: quoteRequest.pickupLongitude,
        dropoff_latitude: quoteRequest.dropoffLatitude,
        dropoff_longitude: quoteRequest.dropoffLongitude,
      });

      return {
        quoteId: quote.id,
        fee: quote.fee,
        currencyCode: quote.currency_code,
        pickupEta: quote.pickup_eta,
        dropoffEta: quote.dropoff_eta,
        duration: quote.duration,
        expiresAt: quote.expires,
      };
    } catch (error) {
      this.logger.error('Failed to get delivery quote:', error);
      throw error;
    }
  }

  async getDelivery(
    deliveryId: string,
    userId: string,
  ): Promise<DeliveryResponseDto> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.customerId !== userId && delivery.sellerId !== userId) {
      throw new ForbiddenException('You do not have access to this delivery');
    }

    if (
      delivery.provider === DeliveryProvider.UBER_DIRECT &&
      delivery.externalDeliveryId
    ) {
      try {
        const uberDelivery = await this.uberDirectService.getDelivery(
          delivery.externalDeliveryId,
        );
        await this.updateDeliveryFromUber(delivery, uberDelivery);
      } catch (error) {
        this.logger.error('Failed to sync with Uber Direct:', error);
      }
    }

    return this.formatDeliveryResponse(delivery);
  }

  async getUserDeliveries(
    userId: string,
    role: 'customer' | 'seller',
  ): Promise<DeliveryResponseDto[]> {
    const where = role === 'customer' ? { customerId: userId } : { sellerId: userId };

    const deliveries = await this.deliveryRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return deliveries.map((delivery) => this.formatDeliveryResponse(delivery));
  }

  async cancelDelivery(
    deliveryId: string,
    userId: string,
    reason: string,
  ): Promise<DeliveryResponseDto> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.customerId !== userId && delivery.sellerId !== userId) {
      throw new ForbiddenException('You do not have access to this delivery');
    }

    if (
      delivery.status === DeliveryStatus.DELIVERED ||
      delivery.status === DeliveryStatus.CANCELED
    ) {
      throw new BadRequestException('Cannot cancel this delivery');
    }

    if (
      delivery.provider === DeliveryProvider.UBER_DIRECT &&
      delivery.externalDeliveryId
    ) {
      try {
        await this.uberDirectService.cancelDelivery(delivery.externalDeliveryId);
      } catch (error) {
        this.logger.error('Failed to cancel Uber Direct delivery:', error);
        throw error;
      }
    }

    delivery.status = DeliveryStatus.CANCELED;
    delivery.cancellationReason = reason;
    await this.deliveryRepository.save(delivery);

    return this.formatDeliveryResponse(delivery);
  }

  async handleWebhook(event: UberDirectWebhookEvent): Promise<void> {
    this.logger.log(`Received Uber Direct webhook: ${event.event_type}`);

    const deliveryId = event.meta.resource_id;

    const delivery = await this.deliveryRepository.findOne({
      where: { externalDeliveryId: deliveryId },
    });

    if (!delivery) {
      this.logger.warn(`Delivery not found for external ID: ${deliveryId}`);
      return;
    }

    try {
      const uberDelivery = await this.uberDirectService.getDelivery(deliveryId);
      await this.updateDeliveryFromUber(delivery, uberDelivery);
    } catch (error) {
      this.logger.error('Failed to update delivery from webhook:', error);
    }
  }

  private async updateDeliveryFromUber(
    delivery: Delivery,
    uberDelivery: any,
  ): Promise<void> {
    const statusMap = {
      pending: DeliveryStatus.PENDING,
      pickup: DeliveryStatus.PICKUP,
      pickup_complete: DeliveryStatus.PICKUP_COMPLETE,
      dropoff: DeliveryStatus.IN_TRANSIT,
      delivered: DeliveryStatus.DELIVERED,
      canceled: DeliveryStatus.CANCELED,
      returned: DeliveryStatus.RETURNED,
    };

    delivery.status = statusMap[uberDelivery.status] || delivery.status;
    delivery.trackingUrl = uberDelivery.tracking_url;
    delivery.pickupEta = uberDelivery.pickup_eta
      ? new Date(uberDelivery.pickup_eta)
      : undefined;
    delivery.dropoffEta = uberDelivery.dropoff_eta
      ? new Date(uberDelivery.dropoff_eta)
      : undefined;

    if (uberDelivery.courier) {
      delivery.courier = {
        name: uberDelivery.courier.name,
        phoneNumber: uberDelivery.courier.phone_number,
        location: uberDelivery.courier.location
          ? {
              latitude: uberDelivery.courier.location.lat,
              longitude: uberDelivery.courier.location.lng,
            }
          : undefined,
        imageUrl: uberDelivery.courier.img_href,
        vehicleType: uberDelivery.courier.vehicle_type,
      };
    }

    if (uberDelivery.status === 'delivered') {
      delivery.deliveredAt = new Date();

      if (uberDelivery.dropoff.verification) {
        delivery.proofOfDelivery = {
          signatureUrl: uberDelivery.dropoff.verification.signature?.image_url,
          signedBy: uberDelivery.dropoff.verification.signature?.signed_by,
          photoUrl: uberDelivery.dropoff.verification.picture?.image_url,
        };
      }
    }

    await this.deliveryRepository.save(delivery);
  }

  private formatDeliveryResponse(delivery: Delivery): DeliveryResponseDto {
    return {
      id: delivery.id,
      orderId: delivery.orderId,
      customerId: delivery.customerId,
      sellerId: delivery.sellerId,
      provider: delivery.provider,
      status: delivery.status,
      externalDeliveryId: delivery.externalDeliveryId,
      deliveryFee: delivery.deliveryFee
        ? parseFloat(delivery.deliveryFee.toString())
        : undefined,
      currencyCode: delivery.currencyCode,
      trackingUrl: delivery.trackingUrl,
      pickupAddress: delivery.pickupAddress,
      pickupContact: delivery.pickupContact,
      pickupNotes: delivery.pickupNotes,
      dropoffAddress: delivery.dropoffAddress,
      dropoffContact: delivery.dropoffContact,
      dropoffNotes: delivery.dropoffNotes,
      courier: delivery.courier,
      pickupEta: delivery.pickupEta,
      dropoffEta: delivery.dropoffEta,
      deliveredAt: delivery.deliveredAt,
      proofOfDelivery: delivery.proofOfDelivery,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    };
  }
}
