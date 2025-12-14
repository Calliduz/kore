export interface User {
  _id: string;
  id?: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  id?: string; // Alias for _id
  name: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  image?: string; // Fallback for single image
  stock: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Order-related types
export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  paymentResult?: PaymentResult;
  status?: "processing" | "shipped" | "delivered";
  createdAt: string;
}

// API Response wrapper - backend uses nested data structure
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: number;
    message: string;
    details?: any;
  };
  errors?: Array<{ field: string; message: string }>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    nextCursor?: string;
  };
}

// Products API specific response
export interface ProductsResponse {
  data: Product[];
  pagination: {
    nextCursor?: string;
    hasMore: boolean;
    limit: number;
  };
}

export interface AuthResponse {
  user: User;
}

export interface OrderResponse {
  order: Order;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface StripeConfigResponse {
  publishableKey: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

// Saved shipping address with metadata
export interface SavedAddress {
  _id: string;
  label: string; // e.g., "Home", "Work", "Office"
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

// Saved payment method (Stripe)
export interface SavedPaymentMethod {
  _id: string;
  stripePaymentMethodId: string;
  last4: string;
  brand: string; // visa, mastercard, amex, etc.
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt?: string;
}

// Refund request
export type RefundStatus = "pending" | "approved" | "rejected" | "processed";
export type RefundReason =
  | "damaged"
  | "wrong_item"
  | "not_as_described"
  | "changed_mind"
  | "other";

export interface RefundRequest {
  _id: string;
  order: string | Order;
  user: string | User;
  reason: RefundReason;
  description?: string;
  items?: { product: string; qty: number; refundAmount: number }[];
  totalRefundAmount: number;
  status: RefundStatus;
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// Response types for new APIs
export interface AddressesResponse {
  addresses: SavedAddress[];
}

export interface PaymentMethodsResponse {
  paymentMethods: SavedPaymentMethod[];
}

export interface RefundsResponse {
  refunds: RefundRequest[];
}
