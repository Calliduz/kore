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

## ✅ Product Reviews API (NEW)

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

## ✅ Cart API

Cart is handled client-side using Zustand store. No backend endpoints required.

---

## ✅ Wishlist API

- **GET** `/api/wishlist` (Auth Required): Returns user's wishlist with populated products
- **POST** `/api/wishlist/:productId` (Auth Required): Adds product to wishlist
- **DELETE** `/api/wishlist/:productId` (Auth Required): Removes product from wishlist

---

## ✅ Newsletter API

- **POST** `/api/newsletter/subscribe`
  - Body: `{ email: string }`
  - Returns 200 on success
  - Returns 409 if email already subscribed (frontend handles gracefully)

---

## ✅ Auth API

- **POST** `/api/auth/login` - Authenticates user, returns JWT token (via httpOnly cookie)
- **POST** `/api/auth/register` - Creates new user account
- **POST** `/api/auth/logout` - Clears auth cookies
- **POST** `/api/auth/refresh` - Refreshes access token using refresh token
- **GET** `/api/auth/me` (Auth Required): Returns current user profile
  - Returns 401 Unauthorized if no valid token

---

## ✅ User Profile API

- **PUT** `/api/users/profile` (Auth Required): Update user profile
  - Body: `{ name: string, password?: string }`
  - Returns updated user object

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
  "couponCode": "SAVE20" // Optional - applied coupon code
}
```

**GET /api/orders/myorders** (Auth Required) - Get user's orders

**GET /api/orders/:id** (Auth Required) - Get order by ID (owner or admin only)

**GET /api/orders** (Admin Auth Required) - Get all orders

**PUT /api/orders/:id/pay** (Auth Required) - Update order payment status

- Body: `{ id, status, update_time, email_address }`

**PUT /api/orders/:id/deliver** (Admin Auth Required) - Mark order as delivered

---

## ✅ Coupons API (NEW)

**GET /api/coupons** (Admin Auth Required) - Get all coupons

```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "_id": "...",
        "code": "SAVE20",
        "discountType": "percentage", // or "fixed"
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

- Body:

```json
{
  "code": "SAVE20",
  "discountType": "percentage",
  "discountValue": 20,
  "minPurchase": 50,
  "maxUses": 100,
  "isActive": true,
  "expiresAt": "2024-12-31"
}
```

**PUT /api/coupons/:id** (Admin Auth Required) - Update coupon

**DELETE /api/coupons/:id** (Admin Auth Required) - Delete coupon

**POST /api/coupons/validate** - Validate coupon code (public)

- Body: `{ code: string, cartTotal: number }`
- Response:

```json
{
  "success": true,
  "data": {
    "valid": true,
    "coupon": { ... },
    "discountAmount": 15.00,
    "message": "Coupon applied successfully"
  }
}
```

- Returns `valid: false` with appropriate message if:
  - Coupon not found
  - Coupon expired
  - Coupon inactive
  - Cart total below minimum purchase
  - Coupon already at max uses

---

## ✅ Payment API

**GET /api/config/stripe** - Get Stripe publishable key

```json
{
  "success": true,
  "data": { "publishableKey": "pk_test_..." }
}
```

**POST /api/payment/create-payment-intent** (Auth Required)

- Body: `{ orderId: string }`
- Returns: `{ success: true, data: { clientSecret: "pi_..." } }`

---

## Frontend Categories

The frontend Shop page uses these category filters:

- Electronics
- Accessories
- Home
- Office
- Travel

The Collections page links to shop with these category mappings:

- Minimalist Living → `?category=Home`
- Workspace → `?category=Office`
- Travel & Carry → `?category=Travel`
- Tech Accessories → `?category=Electronics`

---

## Coupon Schema (Mongoose)

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
    maxUses: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);
```

## Review Schema (Mongoose)

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

// Compound index to ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
```

---

## Summary

All core e-commerce functionality is implemented. Frontend uses:

- React Query for data fetching
- Zustand for cart/wishlist state
- Sonner for toast notifications
- Framer Motion for animations
- TailwindCSS v4 with custom Swiss-inspired theme
- Stripe for payment processing
