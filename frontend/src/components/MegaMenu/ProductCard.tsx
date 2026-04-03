import type { ProductResult } from '../../types/product';

interface ProductCardProps {
  product: ProductResult;
  isFocused: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onMouseEnter?: () => void;
}

export function ProductCard({ product, isFocused, isExpanded, onToggle, onMouseEnter }: ProductCardProps) {
  return (
    <div
      className={`product-card ${isFocused ? 'focused' : ''} ${!product.inStock ? 'dimmed' : ''}`}
      onMouseEnter={onMouseEnter}
    >
      <div className="product-card-name">
        {product.name}
      </div>
      <div className="product-card-details">
        {product.category} &bull; {product.inStock ? `$${product.price.toFixed(2)} \u2022 \u2605 ${product.rating.toFixed(1)}` : 'Out of stock'}
        <span 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{ float: 'right', fontSize: '0.8rem', color: '#6366f1', cursor: 'pointer', fontWeight: 500 }}
        >
          {isExpanded ? 'Less' : 'Show'}
        </span>
      </div>
      {isExpanded && (
        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {product.description}
        </div>
      )}
    </div>
  );
}
