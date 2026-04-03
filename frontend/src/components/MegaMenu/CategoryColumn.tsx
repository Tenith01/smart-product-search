import type { ProductResult } from '../../types/product';
import { HighlightedText } from '../HighlightedText';
import { StarRating } from '../StarRating';

interface CategoryColumnProps {
  category: string;
  products: ProductResult[];
  query: string;
  onSelect: (product: ProductResult) => void;
}

export function CategoryColumn({ category, products, query, onSelect }: CategoryColumnProps) {
  if (products.length === 0) return null;

  return (
    <div className="category-section">
      <h4 className="section-label">More in {category}</h4>
      <div className="category-list">
        {products.map((product) => (
          <div
            key={product.id}
            className="compact-product-card"
            onClick={() => onSelect(product)}
          >
            <div className="compact-card-header">
              <div className="compact-card-name">
                <HighlightedText text={product.name} query={query} />
              </div>
              <span className="compact-card-price">${product.price.toFixed(2)}</span>
            </div>
            <div className="compact-card-meta">
              <span className="star-rating">
                <StarRating rating={product.rating} />
                <span className="rating-value">{product.rating.toFixed(1)}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
