import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  UberDirectConfig,
  UberDirectDeliveryRequest,
  UberDirectDeliveryResponse,
  UberDirectQuoteRequest,
  UberDirectQuote,
} from './interfaces/uber-direct.interface';

@Injectable()
export class UberDirectService {
  private readonly logger = new Logger(UberDirectService.name);
  private readonly config: UberDirectConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      customerId: this.configService.get<string>('UBER_DIRECT_CUSTOMER_ID') || '',
      customerSecret: this.configService.get<string>('UBER_DIRECT_CUSTOMER_SECRET') || '',
      baseUrl:
        this.configService.get<string>('UBER_DIRECT_BASE_URL') ||
        'https://api.uber.com/v1/customers',
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(
      `${this.config.customerId}:${this.config.customerSecret}`,
    ).toString('base64');

    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async createDelivery(
    deliveryRequest: UberDirectDeliveryRequest,
  ): Promise<UberDirectDeliveryResponse> {
    try {
      const url = `${this.config.baseUrl}/${this.config.customerId}/deliveries`;

      this.logger.log(`Creating Uber Direct delivery to ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(deliveryRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('Uber Direct API error:', error);
        throw new BadRequestException(
          `Uber Direct API error: ${error.message || 'Unknown error'}`,
        );
      }

      const delivery = await response.json();
      this.logger.log(`Delivery created successfully: ${delivery.id}`);

      return delivery;
    } catch (error) {
      this.logger.error('Failed to create Uber Direct delivery:', error);
      throw error;
    }
  }

  async getDelivery(deliveryId: string): Promise<UberDirectDeliveryResponse> {
    try {
      const url = `${this.config.baseUrl}/${this.config.customerId}/deliveries/${deliveryId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new BadRequestException(
          `Uber Direct API error: ${error.message || 'Unknown error'}`,
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to get Uber Direct delivery:', error);
      throw error;
    }
  }

  async cancelDelivery(deliveryId: string): Promise<UberDirectDeliveryResponse> {
    try {
      const url = `${this.config.baseUrl}/${this.config.customerId}/deliveries/${deliveryId}/cancel`;

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new BadRequestException(
          `Uber Direct API error: ${error.message || 'Unknown error'}`,
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to cancel Uber Direct delivery:', error);
      throw error;
    }
  }

  async getQuote(
    quoteRequest: UberDirectQuoteRequest,
  ): Promise<UberDirectQuote> {
    try {
      const url = `${this.config.baseUrl}/${this.config.customerId}/delivery_quotes`;

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(quoteRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new BadRequestException(
          `Uber Direct API error: ${error.message || 'Unknown error'}`,
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to get Uber Direct quote:', error);
      throw error;
    }
  }

  async updateDelivery(
    deliveryId: string,
    updates: Partial<UberDirectDeliveryRequest>,
  ): Promise<UberDirectDeliveryResponse> {
    try {
      const url = `${this.config.baseUrl}/${this.config.customerId}/deliveries/${deliveryId}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new BadRequestException(
          `Uber Direct API error: ${error.message || 'Unknown error'}`,
        );
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Failed to update Uber Direct delivery:', error);
      throw error;
    }
  }
}
