export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: number;
        message: string;
        details?: any;
    };
    meta?: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
        nextCursor?: string;
    };
}

export interface AuthResponse {
    user: User;
}
