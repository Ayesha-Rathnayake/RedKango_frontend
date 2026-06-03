export interface RentalCartItem {
  productId: number;
  productCode: string;
  productName: string;
  imageUrl?: string;
  dailyRate: number;
  quantity: number;
  totalUnits?: number;
  availableUnits?: number;
}

export interface RentalDeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface CreateRentalBookingRequest {
  rentalStartDate: string;
  rentalEndDate: string;
  items: {
    productId: number;
    quantity: number;
  }[];
  deliveryAddress: RentalDeliveryAddress;
  customerNote?: string;
}

export interface RentalBookingItem {
  productDbId: number;
  productId: string;
  productName: string;
  imageUrl?: string;
  dailyRate: number;
  quantity: number;
  lineTotal: number;
}

export interface RentalBooking {
  bookingId: number;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;

  rentalStartDate: string;
  rentalEndDate: string;
  totalDays: number;

  items: RentalBookingItem[];

  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;

  bookingStatus: string;
  paymentStatus: string;

  deliveryFullName: string;
  deliveryPhone: string;
  deliveryAddressLine1: string;
  deliveryAddressLine2?: string;
  deliveryCity: string;
  deliveryDistrict: string;
  deliveryPostalCode: string;

  courierName?: string;
  trackingNumber?: string;

  createdAt: string;
  advancePaidAt?: string;
  dispatchedAt?: string;
  returnedAt?: string;
  completedAt?: string;
}

export interface RentalAvailability {
  productId: number;
  productName: string;
  totalUnits: number;
  bookedUnits: number;
  availableUnits: number;
  available: boolean;
}

export interface DispatchRentalRequest {
  courierName: string;
  trackingNumber: string;
}