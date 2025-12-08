# Backend Sync Prompt

This document outlines the **required** backend changes to support the latest frontend features: **Advanced Search & Filtering**, **Wishlist**, and **Newsletter**.

Please implement the following updates in your backend.

## 1. Advanced Product Search & Filtering

To support the new `Shop` page with filters:

### Endpoints
- **GET** `/api/products` (Enhance functionality)
  - **New Query Parameters**:
    - `search`: String. Perform a case-insensitive, fuzzy search on `name` and `description`.
    - `category`: String or Array of Strings. Filter products by category.
    - `sort`: String. Options:
      - `newest`: Sort by `createdAt` (desc).
      - `price_asc`: Sort by `price` (asc).
      - `price_desc`: Sort by `price` (desc).
      - `name_asc`: Sort by `name` (asc).
      - `minPrice` & `maxPrice`: Numbers. Filter by price range.
  - **Response**: Standard paginated product list.

---

## 2. Wishlist Functionality

The frontend has a fully functional UI for the Wishlist. We need to persist this data.

### Data Model
- **Wishlist Schema**:
  - `user`: ObjectId (Reference to User)
  - `products`: [ObjectId] (Array of References to Product)
  - `timestamps`: createdAt, updatedAt

### Endpoints
- **GET** `/api/wishlist`
  - **Auth**: Required.
  - **Response**: List of populated Product objects in the user's wishlist.
- **POST** `/api/wishlist/:productId`
  - **Auth**: Required.
  - **Action**: Add product to user's wishlist if not already present.
- **DELETE** `/api/wishlist/:productId`
  - **Auth**: Required.
  - **Action**: Remove product from user's wishlist.

---

## 3. Newsletter Subscription

For the "Stay Connected" section on the homepage.

### Endpoints
- **POST** `/api/newsletter/subscribe`
  - **Body**: `{ email: string }`
  - **Action**: Save the email. Ensure uniqueness.
  - **Response**: Success message.

---

## 4. General Notes
- Ensure all endpoints use standard HTTP status codes (200, 201, 400, 401, 404, 500).
- Cors should be configured to allow requests from the frontend origin.
