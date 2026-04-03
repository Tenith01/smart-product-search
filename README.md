# TIRON — Smart Product Search

TIRON is a full-stack smart product search application designed to provide a highly relevant, typo-tolerant, and fast search experience. It features a minimalist, centered search widget on the frontend and a powerful NestJS + MongoDB backend using multi-layered heuristic search strategies.

## Project Architecture

The project is structured as a mono-repository with two main applications:

- **Backend**: A robust REST API built with [NestJS](https://nestjs.com/) and [Mongoose](https://mongoosejs.com/). It handles the complex logic for typo correction, dataset seeding, and multi-factor relevance ranking.
- **Frontend**: A lightning-fast, minimalist UI built with [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) and TypeScript. It features a clean, centered search widget that opens a rich "Mega Menu" for instant results and categorized product discovery.

## Quick Start

1. **Prerequisites**: Node 20+, MongoDB running locally (default port: 27017).
2. **Clone the repo**.
3. **Backend Setup**:
   ```bash
   cd backend
   cp .env.example .env  # Optional, defaults are provided
   npm install
   npm run start:dev
   ```
4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. **Open Application**: Navigate to `http://localhost:5173` in your browser.

## Seeding

The application seeds its database automatically on the first startup by parsing the internal mock dataset.
To re-seed test data: stop the backend, drop the `tiron` database in MongoDB, and restart the backend.

## Environment Variables

- `MONGODB_URI` — default: `mongodb://localhost:27017/tiron`
- `PORT` — default: `3001` (Backend API)

## Full-Stack Features

### 1. Minimalist UI & Mega Menu
The frontend provides a Google-like, minimalist search input centered on the screen. As the user types, a specialized Mega Menu appears revealing:
- The top 5 matched products overall.
- Up to 4 localized category-specific results to encourage product exploration.
- Subtle "Did you mean..." hints to smoothly guide the user when typos are corrected.

### 2. Typo Tolerance Pipeline
The backend uses a three-layer approach to ensure users find what they want, regardless of spelling errors:
1. **MongoDB `$text` Search**: Native text indexing handles robust stemming and basic variations.
2. **Levenshtein Distance**: Real-time evaluation against a memory-cached dictionary (built on startup) corrects minor misspellings (e.g., `wirelss` -> `wireless`) using a < 2 calculation threshold limit.
3. **Regex Fallback**: If a standard query returns low relevance or nothing at all, a case-insensitive regex fallback scans over standard attributes to salvage any potential matches.

### 3. Smart Relevance Ranking Logic
The relevance score is a composite formula calculated as follows:
`finalScore = (textScore * 4.0) + (nameMatch ? 3.0 : 0) + (tagMatch * 1.5) + (rating / 5 * 2.0) + (stock > 0 ? 1.0 : -2.0)`
- **Text Score**: Boosted by MongoDB text indexes (`name`, `tags`).
- **Name Match**: Bonus if the corrected terms explicitly match the name.
- **Tag Match**: Additive bonus based on matched tag counts.
- **Rating**: Slight boost for highly-rated products as a tiebreaker.
- **Stock**: Penalty for out-of-stock items to promote available inventory.

## Main API Endpoint

`GET /api/search?q={query}`

**Response Signature:**
- `topResults`: The top 5 matched products overall.
- `byCategory`: Max 4 results per matched category.
- `typoDetected`: Boolean indicating whether the user's input triggered the typo-correction engine.
- `correctedQuery`: The system-corrected search term if typos were found.

## Trade-offs
- **In-memory dictionary**: A custom node-based dictionary is used instead of a robust Lucene-based search index to keep dependencies lean for the assessment.
- **No Monorepo Tooling**: Shared typescript types were duplicated instead of implementing a strict monorepo setup (like Turborepo or Nx) to keep the initial infrastructure straightforward.
- **Pagination**: No pagination is implemented out of the box, as the initial schema is purposefully capped at 50 products.

## Future Improvements
- **Caching**: Implement global caching (like Redis) to accelerate redundant search hits.
- **Search Infrastructure**: Replace MongoDB `$text` with Atlas Search or Elasticsearch for phonetic matching, true typo handling at the cluster level, and faceted filtering capabilities.
- **Testing**: Add proper unit test coverage to edge cases in the Levenshtein pure function and end-to-end tests for the React UI.
