import type { ProductResult } from '../../types/product';
import { HighlightedText } from '../HighlightedText';

interface ProductCardProps {
  product: ProductResult;
  query: string;
  isFocused: boolean;
  onMouseEnter?: () => void;
  onClick: () => void;
}

export function ProductCard({ product, query, isFocused, onMouseEnter, onClick }: ProductCardProps) {
  const ratingPercent = (product.rating / 5) * 100;

  return (
    <div
      className={`product-card${isFocused ? ' focused' : ''}${!product.inStock ? ' dimmed' : ''}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <div className="product-card-header">
        <div className="product-card-name">
          <HighlightedText text={product.name} query={query} />
        </div>
        <span className="category-badge">{product.category}</span>
      </div>
      <div className="product-card-meta">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <span className="meta-separator">·</span>
        <span className="star-rating" title={`${product.rating.toFixed(1)} out of 5`}>
          <span className="stars-container">
            <span className="stars-empty">★★★★★</span>
            <span className="stars-filled" style={{ width: `${ratingPercent}%` }}>★★★★★</span>
          </span>
          <span className="rating-value">{product.rating.toFixed(1)}</span>
        </span>
        <span className="meta-separator">·</span>
        <span className={`stock-indicator ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
          <span className="stock-dot" />
          {product.inStock ? 'In stock' : 'Out of stock'}
        </span>
      </div>
    </div>
  );
}
