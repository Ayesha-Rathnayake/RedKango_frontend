export interface PurchaseCartItem {
  productId: number;
  productCode: string;
  productName: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  availableUnits: number;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface CreateOrderRequest {
  items: {
    productId: number;
    quantity: number;
  }[];
  deliveryAddress: DeliveryAddress;
}

export interface CreateOrderResponse {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
}

export interface OrderItemResponse {
  productDbId: number;
  productId: string;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItemResponse[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  courierName?: string;
  trackingNumber?: string;
  createdAt: string;
  paidAt?: string;
  dispatchedAt?: string;
}