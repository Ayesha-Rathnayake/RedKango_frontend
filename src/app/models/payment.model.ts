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


export interface PayHerePayment {
  sandbox: boolean;

  merchant_id: string;

  return_url: string;
  cancel_url: string;
  notify_url: string;

  order_id: string;
  items: string;
  currency: string;
  amount: string;

  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;

  hash: string;
}

declare global {
  interface Window {
    payhere: {
      onCompleted: (orderId: string) => void;

      onDismissed: () => void;

      onError: (error: unknown) => void;

      startPayment: (
        payment: PayHerePayment
      ) => void;
    };
  }
}
