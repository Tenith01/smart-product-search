import { useEffect } from 'react';
import type { ProductResult } from '../types/product';

interface ProductDetailProps {
  product: ProductResult;
  onClose: () => void;
}

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const ratingPercent = (product.rating / 5) * 100;
  const scorePercent = Math.min(Math.round(product.score * 100), 100);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="detail-header">
          <span className="detail-category">{product.category}</span>
          <h2 className="detail-title">{product.name}</h2>
          <div className="detail-stats">
            <span className="detail-price">${product.price.toFixed(2)}</span>
            <span className="detail-rating star-rating" title={`${product.rating.toFixed(1)} out of 5`}>
              <span className="stars-container">
                <span className="stars-empty">★★★★★</span>
                <span className="stars-filled" style={{ width: `${ratingPercent}%` }}>★★★★★</span>
              </span>
              <span className="rating-value">{product.rating.toFixed(1)}</span>
            </span>
            <span className={`detail-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              <span className="stock-dot" />
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-description-label">Description</div>
          <p className="detail-description">{product.description}</p>

          <div className="detail-footer">
            <span className="detail-score">
              Relevance {scorePercent}%
              <span className="detail-score-bar">
                <span className="detail-score-fill" style={{ width: `${scorePercent}%` }} />
              </span>
            </span>
            {product.inStock && (
              <span className="detail-stock-count">{product.stock} units available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
