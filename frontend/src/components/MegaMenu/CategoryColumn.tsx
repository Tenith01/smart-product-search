import type { ProductResult } from '../../types/product';
import { HighlightedText } from '../HighlightedText';

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
        {products.map((product) => {
          const ratingPercent = (product.rating / 5) * 100;
          return (
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
                  <span className="stars-container">
                    <span className="stars-empty">★★★★★</span>
                    <span className="stars-filled" style={{ width: `${ratingPercent}%` }}>★★★★★</span>
                  </span>
                  <span className="rating-value">{product.rating.toFixed(1)}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
