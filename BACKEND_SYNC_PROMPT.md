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

- **POST** `/api/auth/login` - Authenticates user, returns JWT token
- **POST** `/api/auth/register` - Creates new user account
- **GET** `/api/auth/me` (Auth Required): Returns current user profile
  - Returns 401 Unauthorized if no valid token

---

## ✅ Checkout/Payment API

- **POST** `/api/checkout/create-payment-intent` (Auth Required)
  - Body: `{ items: CartItem[], shippingAddress: Address }`
  - Returns Stripe payment intent client secret

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

## Summary

All core e-commerce functionality is implemented. Frontend uses:
- React Query for data fetching
- Zustand for cart/wishlist state
- Sonner for toast notifications
- Framer Motion for animations
- TailwindCSS v4 with custom Swiss-inspired theme
