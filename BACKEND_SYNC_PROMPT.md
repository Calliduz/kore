# Backend Sync Prompt

This document outlines the **current** backend API contract that the frontend expects.

---

## ✅ Products API (Search & Filter) - IMPLEMENTED

The frontend `Shop` page has been updated to handle the nested `ApiResponse` structure.

**GET /api/products Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name or description (case-insensitive) |
| `category` | string or string[] | Filter by category (single or multiple) |
| `sort` | string | `price_asc`, `price_desc`, `newest`, or `name_asc` |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `cursor` | string | Pagination cursor |
| `limit` | number | Items per page (default: 20) |

**Actual Response Format (Backend):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": {
    "data": [ ...product objects... ],
    "pagination": {
      "hasMore": true,
      "nextCursor": "...",
      "limit": 20
    }
  }
}
```

**Frontend Handling:** The frontend now correctly accesses `response.data.data.data` for products and `response.data.data.pagination` for pagination info.

---

## ✅ Wishlist Functionality - IMPLEMENTED

- **GET** `/api/wishlist` (Auth Required): Returns user's wishlist with populated products.
- **POST** `/api/wishlist/:productId` (Auth Required): Adds product to wishlist.
- **DELETE** `/api/wishlist/:productId` (Auth Required): Removes product from wishlist.

---

## ✅ Newsletter Subscription - IMPLEMENTED

- **POST** `/api/newsletter/subscribe`: Body `{ email: string }`.
  - Handles duplicate emails gracefully.

---

## ✅ Auth & User - IMPLEMENTED

- **GET** `/api/auth/me` (Auth Required): Returns the current user's profile.
- Returns `401 Unauthorized` if no valid token is present.

---

## Summary

All required backend endpoints are implemented and the frontend has been updated to handle the nested `ApiResponse` wrapper structure properly.
