# Backend Sync Prompt

This document outlines the **required** backend changes to support the latest frontend features.

## 1. Products API (Search & Filter)

The frontend `Shop` page relies on the following query parameters for the `GET /api/products` endpoint.

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

**Response Format:**
The API should return a standard paginated response. The frontend currently expects:
```json
{
  "data": [ ...product objects... ],
  "pagination": { ... } // Optional/If applicable
}
```
*Note: If the structure differs, please update the frontend expectation.*

## 2. Wishlist Functionality

- **GET** `/api/wishlist` (Auth Required): Return user's wishlist (populated products).
- **POST** `/api/wishlist/:productId` (Auth Required): Add to wishlist.
- **DELETE** `/api/wishlist/:productId` (Auth Required): Remove from wishlist.

## 3. Newsletter Subscription

- **POST** `/api/newsletter/subscribe`: Body `{ email: string }`.

## 4. Auth & User

- **GET** `/api/auth/me` (Auth Required): Should return the current user's profile.
- Return `401 Unauthorized` if no valid token is present.
