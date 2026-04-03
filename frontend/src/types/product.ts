export interface ProductResult {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  inStock: boolean;
  score: number;
}

export interface SearchResponse {
  query: string;
  correctedQuery: string;
  typoDetected: boolean;
  topResults: ProductResult[];
  byCategory: Record<string, ProductResult[]>;
  totalCount: number;
}
