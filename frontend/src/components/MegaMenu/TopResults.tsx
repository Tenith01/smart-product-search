import type { ProductResult } from '../../types/product';
import { ProductCard } from './ProductCard';

interface TopResultsProps {
  results: ProductResult[];
  query: string;
  focusedIndex: number;
  onHover: (index: number) => void;
  onSelect: (product: ProductResult) => void;
}

export function TopResults({ results, query, focusedIndex, onHover, onSelect }: TopResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="top-results">
      <h4 className="section-label">Top Results</h4>
      <div className="results-list">
        {results.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            query={query}
            isFocused={focusedIndex === index}
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(product)}
          />
        ))}
      </div>
    </div>
  );
}
