export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
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
