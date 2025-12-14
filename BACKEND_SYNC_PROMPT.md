# Backend Sync Prompt

This document outlines the **current** backend API contract that the KORE frontend expects.

---

## ✅ Products API

**GET /api/products**

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name or description (case-insensitive) |
| `category` | string or string[] | Filter by category (single or multiple values) |
| `sort` | string | Sorting option: `price_asc`, `price_desc`, `newest`, or `name_asc` |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `cursor` | string | Pagination cursor for infinite scroll |
| `limit` | number | Items per page (default: 20) |

**Response Format:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": {
    "data": [ ...Product objects... ],
    "pagination": {
      "hasMore": true,
      "nextCursor": "...",
      "limit": 20
    }
  }
}
```

**GET /api/products/:id** - Returns single product

**POST /api/products** (Admin Auth Required) - Create product
**PUT /api/products/:id** (Admin Auth Required) - Update product
**DELETE /api/products/:id** (Admin Auth Required) - Delete product

---

## ✅ Product Reviews API

**GET /api/products/:id/reviews** - Get all reviews for a product

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "...",
        "user": { "_id": "...", "name": "John Doe" },
        "product": "product_id",
        "rating": 5,
        "comment": "Great product!",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "averageRating": 4.5,
    "totalReviews": 10
  }
}
```

**POST /api/products/:id/reviews** (Auth Required) - Create review

- Body: `{ rating: number (1-5), comment?: string }`
- Returns 400 if user already reviewed this product

**GET /api/products/:id/can-review** (Auth Required) - Check if user can review

```json
{
  "success": true,
  "data": {
    "canReview": true,
    "hasPurchased": true,
    "hasReviewed": false
  }
}
```

---

## ✅ Users API

**GET /api/users** (Admin Auth Required) - Get all users

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

**GET /api/users/:id** (Admin Auth Required) - Get user by ID

**PUT /api/users/:id/role** (Admin Auth Required) - Update user role

- Body: `{ role: "user" | "admin" }`

**DELETE /api/users/:id** (Admin Auth Required) - Delete user

- Returns 403 if trying to delete self

---

## ✅ User Addresses API (NEW)

**GET /api/users/addresses** (Auth Required) - Get user's saved addresses

```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "_id": "...",
        "label": "Home",
        "address": "123 Main St",
        "city": "New York",
        "postalCode": "10001",
        "country": "USA",
        "isDefault": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

**POST /api/users/addresses** (Auth Required) - Create new address

- Body: `{ label, address, city, postalCode, country, isDefault? }`

**PUT /api/users/addresses/:id** (Auth Required) - Update address

- Body: `{ label?, address?, city?, postalCode?, country?, isDefault? }`

**DELETE /api/users/addresses/:id** (Auth Required) - Delete address

**PUT /api/users/addresses/:id/default** (Auth Required) - Set as default address

---

## ✅ User Payment Methods API (NEW)

**GET /api/users/payment-methods** (Auth Required) - Get user's saved payment methods

```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      {
        "_id": "...",
        "stripePaymentMethodId": "pm_...",
        "last4": "4242",
        "brand": "visa",
        "expiryMonth": 12,
        "expiryYear": 2025,
        "isDefault": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

**POST /api/users/payment-methods** (Auth Required) - Add payment method

- Body: `{ stripePaymentMethodId: string }`
- Backend attaches payment method to Stripe customer and stores metadata

**DELETE /api/users/payment-methods/:id** (Auth Required) - Remove payment method

**PUT /api/users/payment-methods/:id/default** (Auth Required) - Set as default

---

## ✅ Orders API

**POST /api/orders** (Auth Required) - Create new order

- Body:

```json
{
  "orderItems": [
    { "product": "id", "name": "...", "qty": 2, "price": 29.99, "image": "url" }
  ],
  "shippingAddress": {
    "address": "...",
    "city": "...",
    "postalCode": "...",
    "country": "..."
  },
  "paymentMethod": "stripe",
  "taxPrice": 5.0,
  "shippingPrice": 10.0,
  "totalPrice": 74.99,
  "couponCode": "SAVE20"
}
```

**GET /api/orders/myorders** (Auth Required) - Get user's orders

**GET /api/orders/:id** (Auth Required) - Get order by ID (owner or admin only)

**GET /api/orders** (Admin Auth Required) - Get all orders

**PUT /api/orders/:id/pay** (Auth Required) - Update order payment status

- Body: `{ id, status, update_time, email_address }`

**PUT /api/orders/:id/deliver** (Admin Auth Required) - Mark order as delivered

**PUT /api/orders/:id/status** (Admin Auth Required) - Update order status

- Body: `{ status: "processing" | "shipped" | "delivered" }`

---

## ✅ Refund Requests API (NEW)

**POST /api/orders/:id/refund** (Auth Required) - Request refund for an order

- Body:

```json
{
  "reason": "damaged" | "wrong_item" | "not_as_described" | "changed_mind" | "other",
  "description": "Optional details...",
  "items": [{ "product": "product_id", "qty": 1 }]
}
```

- Response: `{ success: true, data: { refund: RefundRequest } }`

**GET /api/orders/:id/refund** (Auth Required) - Get refund status for an order

```json
{
  "success": true,
  "data": {
    "refund": {
      "_id": "...",
      "order": "order_id",
      "user": "user_id",
      "reason": "damaged",
      "description": "...",
      "items": [...],
      "totalRefundAmount": 49.99,
      "status": "pending" | "approved" | "rejected" | "processed",
      "adminNotes": "...",
      "processedAt": "...",
      "createdAt": "..."
    }
  }
}
```

**GET /api/users/refunds** (Auth Required) - Get all user's refund requests

**GET /api/admin/refunds** (Admin Auth Required) - Get all refund requests

**PUT /api/admin/refunds/:id** (Admin Auth Required) - Update refund status

- Body: `{ status: "approved" | "rejected" | "processed", adminNotes?: string }`

---

## ✅ Coupons API

**GET /api/coupons** (Admin Auth Required) - Get all coupons

```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "_id": "...",
        "code": "SAVE20",
        "discountType": "percentage",
        "discountValue": 20,
        "minPurchase": 50,
        "maxUses": 100,
        "usedCount": 5,
        "isActive": true,
        "expiresAt": "2024-12-31T23:59:59Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

**POST /api/coupons** (Admin Auth Required) - Create coupon
**PUT /api/coupons/:id** (Admin Auth Required) - Update coupon
**DELETE /api/coupons/:id** (Admin Auth Required) - Delete coupon

**POST /api/coupons/validate** - Validate coupon code (public)

- Body: `{ code: string, cartTotal: number }`
- Response: `{ valid: boolean, coupon?: {...}, discountAmount?: number, message: string }`

---

## ✅ Auth API

- **POST /api/auth/login** - Authenticates user
- **POST /api/auth/register** - Creates new user account
- **POST /api/auth/logout** - Clears auth cookies
- **POST /api/auth/refresh** - Refreshes access token
- **GET /api/auth/me** (Auth Required): Returns current user profile

---

## ✅ User Profile API

- **PUT /api/users/profile** (Auth Required): Update user profile

---

## ✅ Payment API

**GET /api/config/stripe** - Get Stripe publishable key

**POST /api/payment/create-payment-intent** (Auth Required)

- Body: `{ orderId: string }`
- Returns: `{ success: true, data: { clientSecret: "pi_..." } }`

---

## ✅ Wishlist API

- **GET /api/wishlist** (Auth Required)
- **POST /api/wishlist/:productId** (Auth Required)
- **DELETE /api/wishlist/:productId** (Auth Required)

---

## ✅ Newsletter API

- **POST /api/newsletter/subscribe** - Returns 409 if already subscribed

---

## Mongoose Schemas

### User Schema (Updated)

```javascript
const addressSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // "Home", "Work", etc.
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const paymentMethodSchema = new mongoose.Schema(
  {
    stripePaymentMethodId: { type: String, required: true },
    last4: { type: String, required: true },
    brand: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [addressSchema],
    paymentMethods: [paymentMethodSchema],
  },
  { timestamps: true }
);
```

### Order Schema (Updated)

```javascript
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [...],
  shippingAddress: {...},
  paymentMethod: { type: String, required: true },
  taxPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  status: { type: String, enum: ['processing', 'shipped', 'delivered'], default: 'processing' },
  paymentResult: {...},
}, { timestamps: true });
```

### Refund Request Schema (NEW)

```javascript
const refundRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: [
        "damaged",
        "wrong_item",
        "not_as_described",
        "changed_mind",
        "other",
      ],
      required: true,
    },
    description: { type: String },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        qty: { type: Number, required: true },
        refundAmount: { type: Number },
      },
    ],
    totalRefundAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processed"],
      default: "pending",
    },
    adminNotes: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);
```

### Coupon Schema

```javascript
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);
```

### Review Schema

```javascript
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });
```

---

## Summary

All core e-commerce functionality implemented. Key new additions:

- **User Addresses API** - CRUD for saved shipping addresses (embedded in User)
- **User Payment Methods API** - Managing saved payment methods via Stripe
- **Refund Requests API** - Full refund request workflow with admin approval
- **Updated User Schema** - Now includes `addresses[]` and `paymentMethods[]`
- **New RefundRequest Schema** - For tracking return/refund requests
