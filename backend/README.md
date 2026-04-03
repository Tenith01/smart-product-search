# TIRON Smart Product Search - Backend

This is the backend service for TIRON Smart Product Search, built with [NestJS](https://nestjs.com/) and [MongoDB](https://www.mongodb.com/). It provides an advanced, typo-tolerant search capability with intelligent custom ranking to deliver the most relevant products to users.

## ✨ Features

- **Typo-Tolerant Search**: Automatically corrects spelling mistakes in user queries by finding the closest token using a custom dictionary and Levenshtein distance.
- **Custom Ranking Engine**: Sophisticated scoring based on multiple factors: text query relevance (MongoDB `$text`), direct name matching, tag overlap, product review rating, and stock availability.
- **Auto-Seeding**: Populates the database automatically with sample products from `data/products.json` when the applicaton starts with an empty database.
- **Categorized Results**: Responses include globally top-ranked items alongside contextually relevant items grouped by category.

---

## 🚀 API Endpoints

### 1. Search Endpoint
**`GET /search`**
- **Description**: The primary search API. It runs query analysis, typo correction, MongoDB text search, fallback regex searches, and intelligent result ranking.
- **Query Parameters**:
  - `q` (string, required): The user's search query.
- **Example Request**:
  ```bash
  curl "http://localhost:3000/search?q=smrtphone"
  ```
- **Example Response**:
  ```json
  {
    "query": "smrtphone",
    "correctedQuery": "smartphone",
    "typoDetected": true,
    "topResults": [
      {
        "id": "prod-1",
        "name": "Samsung Galaxy S24 Ultra",
        "description": "Premium flagship smartphone",
        "category": "Smartphones",
        "price": 1199,
        "rating": 4.8,
        "stock": 150,
        "inStock": true,
        "score": 12.85
      }
    ],
    "byCategory": {
      "Accessories": [
        {
           "id": "prod-2",
           "name": "Smartphone Stand",
           ...
        }
      ]
    },
    "totalCount": 2
  }
  ```

### 2. Root Endpoint
**`GET /`**
- **Description**: Health check endpoint to verify the NestJS API is operational.
- **Response**: `"Hello World!"`

### 3. Products
**`/products`**
- **Description**: Bootstrapped resource controller for raw product management. (Base implementation available for future product CRUD expansion).

---

## 🛠️ Project Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a running instance of **MongoDB**.

1. **Install dependencies**
```bash
npm install
```

2. **Configure Environment variables**
Create a `.env` file in the root of the backend directory with your MongoDB connection string (or rely on the default module fallback).
```env
MONGODB_URI=mongodb://localhost:27017/tiron-search
```

### Running the App

```bash
# development
npm run start

# watch mode (recommended for development)
npm run start:dev

# production mode
npm run start:prod
```

## 🏗️ Architecture & Behaviors

- **Bootstrap Seeding**: During `OnApplicationBootstrap` (`src/seed/seed.service.ts`), the application checks the `products` MongoDB collection. If the collection is empty, it securely pulls from `data/products.json` and seeds the collection using `insertMany`.
- **Search Dictionary Build**: During startup (`src/search/search.service.ts`), a token dictionary builds in memory based on the product names and tags in the collection to support fast, low-latency typo correction prior to database communication.
