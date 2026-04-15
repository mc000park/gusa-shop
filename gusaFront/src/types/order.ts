export interface CartItem {
  productId: number;
  title: string;
  price: number;
  originalPrice: number;
  quantity: number;
  subject: string;
}

export interface OrderCreateRequest {
  recipientName: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  deliveryMemo?: string;
  paymentMethod?: string;   // 'BANK_TRANSFER' | 'PG'
  items: Array<{ productId: number; quantity: number }>;
}

export interface OrderItem {
  productId: number;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  orderId: string;
  userId: string;
  status: string; // PENDING | PAID | SHIPPING | DELIVERED | CANCELED
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
  recipientName: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  deliveryMemo: string | null;
  paymentId: string | null;
  paymentMethod: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderPageResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
