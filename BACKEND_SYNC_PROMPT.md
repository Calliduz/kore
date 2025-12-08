# Backend Sync Prompt

This document outlines the **new** backend changes required to support the recent frontend enhancements. Please assume standard REST API conventions.

## 1. Wishlist Functionality

The frontend currently uses local storage for the wishlist. To enable cross-device synchronization, please implement:

### Data Model
- **Wishlist Schema**:
  - `user`: ObjectId (Reference to User)
  - `products`: [ObjectId] (Array of References to Product)
  - `timestamps`: createdAt, updatedAt

### Endpoints
- **GET** `/api/wishlist`
  - **Auth**: Required (Middleware should reject unauthenticated requests)
  - **Response**: List of Product objects in the user's wishlist (populated).
- **POST** `/api/wishlist/:productId`
  - **Auth**: Required
  - **Action**: Add product to wishlist. Returns updated wishlist.
- **DELETE** `/api/wishlist/:productId`
  - **Auth**: Required
  - **Action**: Remove product from wishlist. Returns updated wishlist.

## 2. Advanced Search & Filtering

To support the search bar and improved collection filtering:

### Endpoints
- **GET** `/api/products` (Enhancement)
  - **Query Params**:
    - `search`: String (Search by name or description, case-insensitive, fuzzy matching if possible)
    - `category`: String (Filter by category)
    - `sort`: String (e.g., 'price_asc', 'price_desc', 'newest')
  - **Response**: Paginated list of products.

## 3. Newsletter Subscription

To support the new Newsletter component on the home page:

### Data Model
- **Subscriber Schema**:
  - `email`: String (Unique, Required)
  - `subscribedAt`: Date

### Endpoints
- **POST** `/api/newsletter/subscribe`
  - **Body**: `{ email: string }`
  - **Action**: Save email to database. Handle duplicates gracefully (return success if already subscribed).
