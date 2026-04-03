# TIRON   Smart Product Search

## Live demo

**Try the deployed app:** [https://smart-product-search-eight.vercel.app/](https://smart-product-search-eight.vercel.app/)

The live build uses the same stack as local development: React + TypeScript frontend, NestJS + MongoDB backend, and server-side search (no client-side filtering). Point the frontend at your API URL in production (see [Environment variables](#environment-variables)).

---

## What this project is

**TIRON** is a full-stack **smart product search** for a fixed catalog: **50 products** across **six categories** (Electronics, Clothing, Home, Sports, Beauty, Books), with names, descriptions, SKUs, stock, prices, tags, and ratings. Search is **ranked**, **typo-tolerant**, and results are shown in a **mega menu** dropdown not a flat list.

This repository fulfills the **technical assessment** requirements: React + TS frontend, Node (NestJS) + TS backend, MongoDB with **seeded** data (not in-memory inventory), **search logic only on the backend**, and **no third-party search engines** (Algolia, Typesense, Elasticsearch, etc.) MongoDB text search and custom heuristics are used instead.

---

## Assessment requirements (how this repo maps to them)

| Requirement | Implementation |
| :--- | :--- |
| **Typo tolerance** (`samsng`, `wirelss`, `mernio`, etc.) | Query tokens are corrected against a **catalog vocabulary** (built from names, tags, descriptions, categories) using **Levenshtein distance** with a **length-aware max distance** (short tokens are stricter). Corrected tokens feed MongoDB `$text` search and ranking. |
| **Ranked results** | Composite **relevance score** after `$text` retrieval: text score, name/phrase/prefix/tag/description/category signals, rating, stock then tie-breakers. See [Ranking logic](#ranking-logic). |
| **Mega menu UI** | Dropdown with **top overall results** and **per-category columns** (“more in …”), aligned with the assessment wireframe. |
| **MongoDB + seed** | `backend/data/products.json` is imported on startup when the collection is empty. Data lives in MongoDB, not in application memory as the source of truth. |
| **Backend-only search** | The React app calls `GET /api/search`; no client-side filtering of the catalog. |
| **No external search SaaS** | Uses MongoDB text indexes + custom token dictionary + regex fallback. |
| **README** | This file: setup, seed, run, ranking, typo strategy, mega menu API, trade-offs. |

**Optional “your call” extras** (and why they exist):

- **Debounced search + request cancellation** in the frontend to avoid flooding the API while typing.
- **“Did you mean”**-style feedback via `correctedQuery` and `typoDetected` in the API response.
- **Regex fallback** when `$text` returns nothing, so partial matches still surface.
- **Text index weights** favor `name` over `tags` over `description` for MongoDB’s text score.

---

## Tech stack

| Layer | Choice |
| :--- | :--- |
| Frontend | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| Backend | [NestJS](https://nestjs.com/), TypeScript |
| Database | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| Validation | `class-validator` / `class-transformer` for query DTOs |

Repository layout: **two apps** in one repo (`backend/`, `frontend/`) no Turborepo/Nx; types are duplicated intentionally to keep tooling simple.

---

## Repository layout

```
backend/
  data/products.json          # Seed file (50 products; do not rename schema fields)
  src/
    seed/                     # Auto-seed on bootstrap if DB empty
    products/                 # Mongoose schema + indexes
    search/                   # Search service, token dictionary, Levenshtein, tests
frontend/
  src/
    components/               # SearchBar, MegaMenu, product UI
    hooks/useSearch.ts        # Debounced fetch to /api/search
```

---

## Prerequisites

- **Node.js 20+**
- **MongoDB** reachable locally (default `mongodb://localhost:27017`) or a remote URI

---

## How to run the app

1. Start **MongoDB** (local or remote URI in `backend/.env` as `MONGODB_URI`).
2. From **`backend/`**: `npm install` → `npm run start:dev` (waits on port **3001**, seeds if empty).
3. From **`frontend/`**: `npm install` → `npm run dev` (opens **5173**, proxies `/api` to the backend).
4. Open **`http://localhost:5173`** and search; the mega menu shows **`topResults`** and **`byCategory`**.

Details: [Local setup](#local-setup), [MongoDB seed](#mongodb-seed-instructions), [Environment variables](#environment-variables).

---

## Local setup

1. **Clone** this repository and ensure **Node.js 20+** and **MongoDB** are installed.
2. **Start MongoDB** on the default host/port (**`mongodb://localhost:27017`**) or note your connection string for `MONGODB_URI`.
3. **Backend** — install deps, optional env file, start the API (see commands below).
4. **Frontend** — install deps, optional env file, start Vite (see commands below).
5. **Open** **`http://localhost:5173`** and use the search box; results open in the mega menu.

Use **npm** or **yarn** in each app directory; scripts are the same (`install`, `start:dev` / `dev`, etc.).

### Backend

```bash
cd backend
npm install
# Optional: create backend/.env — see Environment variables
npm run start:dev
```

- API: **`http://localhost:3001`** (or `PORT` from env).
- Global prefix **`/api`** → search: **`GET /api/search?q=...`**.

### Frontend

```bash
cd frontend
npm install
# Optional: copy frontend/.env.example to frontend/.env — see Environment variables
npm run dev
```

- UI: **`http://localhost:5173`** (Vite default).
- In dev, Vite **proxies `/api`** to the backend (`VITE_API_URL`, default **`http://localhost:3001`**).

---

## MongoDB seed instructions

1. **Automatic seed (recommended)**  
   On backend startup, **`SeedService`** runs during **`OnApplicationBootstrap`**. **`SeedModule`** is registered **before** **`SearchModule`** in **`app.module.ts`**, so an empty database is **seeded before** the search service builds its token dictionary from MongoDB. If the products collection has **zero** documents, the seed reads **`backend/data/products.json`** (path relative to `process.cwd()` — run the backend from **`backend/`**) and **`insertMany`** all rows. Product **field names** match the assessment schema; **text and category indexes** are defined in **`products.schema.ts`**.

2. **Re-seed from scratch**  
   - Stop the backend.  
   - Drop the database (or only the `products` collection) so the count is **0**. Example with `mongosh`: connect to your URI, then `use tiron` (or your DB name from `MONGODB_URI`) and `db.products.deleteMany({})` or `db.dropDatabase()`.  
   - Start the backend again; you should see **“Successfully seeded … products”** in the logs.

3. **Verify**  
   Logs show either **“Successfully seeded … products”** or **“Database already seeded with … products.”** After seeding, **`SearchService`** builds the typo-correction vocabulary from MongoDB.

**Note:** If you run the Nest app with a different working directory, ensure `data/products.json` is still resolvable or adjust the seed path.

---

## Environment variables

### Backend (`backend/.env`, optional)

| Variable | Purpose | Default |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/tiron` |
| `PORT` | HTTP port | `3001` |

### Frontend (`frontend/.env`, optional)

| Variable | Purpose | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Target for Vite **proxy** in dev (`/api` → this origin) | `http://localhost:3001` |

For **production** (e.g. Vercel), configure the frontend to call your deployed API (proxy path, env, or reverse proxy) so `/api/search` resolves correctly.

---

## Main API: search

**`GET /api/search?q={query}`**

Query is validated via `SearchQueryDto` (empty or missing `q` is handled safely).

**Response shape (JSON):**

| Field | Meaning |
| :--- | :--- |
| `query` | Original user query string |
| `correctedQuery` | Space-joined tokens after per-token typo correction |
| `typoDetected` | `true` if any token was replaced with a dictionary match |
| `topResults` | **Up to 5** products: the globally highest-ranked slice of the list |
| `byCategory` | **Record** keyed by **category name** (e.g. `"Electronics"`). Each category lists **up to 4** products taken **only** from ranked positions **6 and below** (see below). |
| `totalCount` | Length of the full ranked candidate list (same ordering as used to build `topResults` and `byCategory`) |

Each product object includes `id`, `name`, `description`, `category`, `price`, `rating`, `stock`, `inStock`, and `score` (composite relevance after ranking).

### Mega menu API: how the response is structured

The UI needs **one global “hero” row** plus **per-category columns**. The API mirrors that without duplicating products between the two areas:

1. **Rank once** — All MongoDB candidates are scored and sorted by **`finalScore`**, then rating, then name (see [Ranking logic](#ranking-logic)).
2. **`topResults`** — **`rankedResults.slice(0, 5)`** — the five best products for the **“TOP RESULTS”** block.
3. **`byCategory`** — Start from **`rankedResults.slice(5)`** (everything after the top five). Walk that list in rank order; for each product, append it to **`byCategory[product.category]`** until that category’s array has **four** items. Products that never get a slot (because their category already has four from higher-ranked “remainder” items) are omitted from the mega menu columns but still counted in **`totalCount`** as part of the full ranked list.

**Mapping to the UI**

- **“TOP RESULTS”** → `topResults`.
- **“MORE IN {CATEGORY}”** → `byCategory[categoryName]`.

**Trade-off in this shape:** Category columns are **not** a second full search per category; they are a **single ranked stream** split for display. That keeps the API **one round-trip** and **deterministic**, but a category with many relevant items may show only four from the “tail” of the global ranking, not the four best *within that category* in isolation.

---

## Ranking logic

**Retrieval**

1. Query tokens are **typo-corrected** (see below), then **`$text: { $search: correctedQuery }`** runs against the text index.
2. Results are sorted by MongoDB **`textScore`** (`$meta`) for the initial candidate set.
3. If **`$text`** returns **no** documents, a **case-insensitive regex** match is used (`$and` of per-token `$or` on `name`, `tags`, `description`). Those hits get a fixed **`textScore` of 0.5** so they can still compete after the composite step.

**Text index weights** (in `products.schema.ts`): **`name: 10`**, **`tags: 6`**, **`description: 2`** — MongoDB’s built-in score favors titles and tags over long copy.

**Composite `finalScore`** (implemented in `search.service.ts`):

```text
finalScore =
  textScore * 4.0
  + (nameMatch ? 3.0 : 0)
  + exactPhraseMatch * 5.0
  + namePrefixBoost * 1.5
  + tagMatchCount * 1.5
  + descMatchCount * 0.9
  + (categoryMatch ? 1.2 : 0)
  + (rating / 5) * 2.0
  + (stock > 0 ? 1.0 : -2.0)
```

| Signal | Role |
| :--- | :--- |
| **`textScore`** | Weighted MongoDB text relevance (scaled by `4.0`). |
| **`nameMatch`** | Any corrected token appears in the **normalized** product name. |
| **`exactPhraseMatch`** | Full normalized name equals the full corrected phrase. |
| **`namePrefixBoost`** | Normalized name **starts with** the first corrected token (good for prefix-style queries). |
| **`tagMatchCount` / `descMatchCount`** | How many corrected tokens hit tags vs description (tags weighted higher per match). |
| **`categoryMatch`** | A token matches the normalized category string. |
| **Rating / stock** | Mild preference for higher stars; **out-of-stock** is penalized (`-2.0` vs `+1.0`). |

**Final sort:** **`finalScore` descending**, then **`rating` descending**, then **`name` ascending** (locale-aware string compare).

---

## Typo tolerance approach

1. **Vocabulary**  
   After MongoDB is populated, **`TokenDictionary`** runs on bootstrap: it tokenizes **product names, tags, descriptions, and categories** (same normalization as search) and stores a **set of known tokens** plus **per-token frequency** in the catalog.

2. **Per-token correction**  
   If the query token is already in the vocabulary, it is left unchanged. Otherwise **Levenshtein distance** is computed to every vocabulary token. Only candidates within a **length-aware max distance** are allowed:

   | Query token length | Max edit distance |
   | :--- | :---: |
   | 1–2 characters | **0** (no correction; avoids turning `"tv"` into unrelated words) |
   | 3–4 characters | **1** |
   | 5+ characters | **2** |

   **Tie-breaking** when multiple vocabulary tokens tie on distance: **lower distance** wins, then **higher catalog frequency**, then **longer token** (more specific).

3. **Search**  
   The **space-joined corrected query** feeds MongoDB **`$text`**. If there are **zero** hits, the **regex** fallback (above) runs on the **corrected** tokens.

4. **Limits**  
   Correction is **dictionary-only**: unknown tokens that are too far from any catalog token stay as-is. There is **no** phonetic layer (Soundex, etc.).

5. **Transparency**  
   The API returns **`correctedQuery`** and **`typoDetected`** so the client can show “did you mean”-style feedback.

---

## Trade-offs

| Area | Choice | Cost |
| :--- | :--- | :--- |
| **Typo model** | Levenshtein over a **static catalog vocabulary** | Words never seen in the catalog are not “fixed”; short tokens are strict by design. |
| **Retrieval** | MongoDB **`$text`** + custom rerank | No BM25 tuning per field at index time beyond weights; regex fallback is **not** ranked like full-text. |
| **Mega menu** | **One** global ranking; category columns are a **partition** of ranks 6+ | “Best in category” is **not** independent per column—only the global order. |
| **Scale** | In-memory **`TokenDictionary`** on one Node process | Fine for 50 products; large catalogs need incremental vocab updates and memory bounds. |
| **Repo layout** | Two packages, **duplicated** TS types | Simple tooling; shared types would need a small shared package or codegen. |
| **Pagination** | None | Acceptable for a fixed 50-item assessment dataset only. |

### What we would change with more time or scale

- **Per-category top-N** — If the product spec required “best four *in Electronics*” independent of global rank, add either a **second pass** (`$text` + rank within each category) or **precomputed** category facets—at the cost of latency or storage.
- **Stronger fuzzy retrieval** — e.g. **trigram**-style or **phonetic** fields in MongoDB, or a **dedicated** search engine—if typo correction via Levenshtein on tokens is not enough for real user queries.
- **Shared types** — A **`packages/types`** workspace or OpenAPI-generated client types so frontend and backend **never drift**.
- **Observability** — Structured logs and metrics for **empty results**, **regex fallback rate**, and **correction overrides** to tune weights safely.
- **Tests** — More **golden-file** search cases from real messy queries; optional **load tests** on `/api/search` if deployed under traffic.

---

## Testing (backend)

From `backend/`:

```bash
npm test                 # Unit tests (*.spec.ts)
npm run test:e2e         # E2E (separate Jest config)
npm run test:cov         # Coverage
```

Includes search integration tests and utilities (e.g. token dictionary, Levenshtein).

---

## Scripts reference

| Location | Command | Purpose |
| :--- | :--- | :--- |
| Backend | `npm run start:dev` | Dev server with watch |
| Backend | `npm run build` / `npm run start:prod` | Production build & run |
| Frontend | `npm run dev` | Vite dev server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run preview` | Preview production build locally |

---

## License / usage

Backend `package.json` may list `UNLICENSED`; treat as private assessment code unless you add a public license.

---

*Assessment brief: build ranked, typo-tolerant search with a mega menu, MongoDB seed, and explainable design decisions this README is the deliverable description for that brief.*
