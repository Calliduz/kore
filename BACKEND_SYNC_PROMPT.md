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

## ✅ Users API (NEW)

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

**PUT /api/orders/:id/status** (Admin Auth Required) - Update order status (NEW)

- Body: `{ status: "processing" | "shipped" | "delivered" }`

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

### User Schema

```javascript
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
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

- **User Management API** for admin to view/update/delete users
- **Order Status API** for tracking order progress (processing → shipped → delivered)
- **Updated User schema** with `_id` field for consistency
