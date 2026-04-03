import type { ProductResult } from '../../types/product';
import { ProductCard } from './ProductCard';

interface TopResultsProps {
  results: ProductResult[];
  focusedIndex: number;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onHover: (index: number) => void;
}

export function TopResults({ results, focusedIndex, expandedId, onToggle, onHover }: TopResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="top-results">
      <h4 className="section-label">TOP RESULTS</h4>
      <div className="results-list">
        {results.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            isFocused={focusedIndex === index}
            isExpanded={expandedId === product.id}
            onToggle={() => onToggle(product.id)}
            onMouseEnter={() => onHover(index)}
          />
        ))}
      </div>
    </div>
  );
}
