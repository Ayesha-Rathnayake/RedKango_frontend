export interface PayHereInitRequest {
  orderId: number;
}

export interface PayHereInitResponse {
  checkoutUrl: string;
  merchantId: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  orderId: string;
  items: string;
  currency: string;
  amount: string;
  hash: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface PayHereRentalInitRequest {
  bookingId: number;
}