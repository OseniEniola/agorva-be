export interface UberDirectConfig {
  customerId: string;
  customerSecret: string;
  baseUrl: string;
}

export interface UberDirectLocation {
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface UberDirectContact {
  first_name: string;
  last_name?: string;
  phone_number: string;
  email?: string;
  company_name?: string;
  send_notifications?: boolean;
}

export interface UberDirectItem {
  title: string;
  quantity: number;
  price?: number;
  currency_code?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  weight?: number;
  must_be_upright?: boolean;
  is_fragile?: boolean;
}

export interface UberDirectPickup {
  location: UberDirectLocation;
  contact: UberDirectContact;
  notes?: string;
  ready_dt?: string;
  deadline_dt?: string;
}

export interface UberDirectDropoff {
  location: UberDirectLocation;
  contact: UberDirectContact;
  notes?: string;
  ready_dt?: string;
  deadline_dt?: string;
  signature_required?: boolean;
  proof_of_delivery_photo_required?: boolean;
}

export interface UberDirectDeliveryRequest {
  pickup: UberDirectPickup;
  dropoff: UberDirectDropoff;
  items: UberDirectItem[];
  manifest_reference?: string;
  pickup_reference?: string;
  dropoff_reference?: string;
  external_store_id?: string;
  undeliverable_action?: 'leave_at_door' | 'return';
  tip?: number;
}

export interface UberDirectQuoteRequest {
  pickup_address: string;
  dropoff_address: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
}

export interface UberDirectQuote {
  id: string;
  created: string;
  expires: string;
  fee: number;
  currency_code: string;
  dropoff_eta?: string;
  pickup_eta?: string;
  duration?: number;
  dropoff_deadline?: string;
}

export interface UberDirectDeliveryResponse {
  id: string;
  status: string;
  complete: boolean;
  kind: string;
  pickup: {
    name: string;
    phone_number: string;
    address: string;
    detailed_address: {
      street_address: string[];
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    location: {
      lat: number;
      lng: number;
    };
    notes?: string;
    verification?: {
      signature?: {
        image_url?: string;
        signed_by?: string;
      };
    };
  };
  dropoff: {
    name: string;
    phone_number: string;
    address: string;
    detailed_address: {
      street_address: string[];
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    location: {
      lat: number;
      lng: number;
    };
    notes?: string;
    verification?: {
      signature?: {
        image_url?: string;
        signed_by?: string;
      };
      picture?: {
        image_url?: string;
      };
    };
  };
  items: Array<{
    title: string;
    quantity: number;
    price?: {
      amount: number;
      currency_code: string;
    };
  }>;
  courier?: {
    name?: string;
    phone_number?: string;
    location?: {
      lat: number;
      lng: number;
    };
    img_href?: string;
    vehicle_type?: string;
  };
  fee: number;
  currency: string;
  tracking_url: string;
  undeliverable_action: string;
  created: string;
  updated: string;
  pickup_eta?: string;
  dropoff_eta?: string;
  dropoff_deadline?: string;
  quote_id?: string;
  manifest_reference?: string;
  external_store_id?: string;
  related_deliveries?: string[];
}

export enum UberDirectDeliveryStatus {
  PENDING = 'pending',
  PICKUP = 'pickup',
  PICKUP_COMPLETE = 'pickup_complete',
  DROPOFF = 'dropoff',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  RETURNED = 'returned',
}

export interface UberDirectWebhookEvent {
  event_id: string;
  event_type: string;
  event_time: string;
  resource_href: string;
  meta: {
    user_id: string;
    resource_id: string;
    status: string;
  };
}
