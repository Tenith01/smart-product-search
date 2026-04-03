import type { ProductResult } from '../../types/product';

interface CategoryColumnProps {
  category: string;
  products: ProductResult[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}

export function CategoryColumn({ category, products, expandedId, onToggle }: CategoryColumnProps) {
  if (products.length === 0) return null;

  return (
    <div className="category-column">
      <h4 className="section-label">MORE IN {category.toUpperCase()}</h4>
      <div className="category-list">
        {products.map((product) => {
          const isExpanded = expandedId === product.id;
          return (
            <div 
              key={product.id} 
              className="compact-product-card"
            >
              <div className="product-card-name">
                {product.name}
              </div>
              <div className="product-card-details">
                ${product.price.toFixed(2)} &bull; &#9733; {product.rating.toFixed(1)}
                <span 
                  onClick={(e) => { e.stopPropagation(); onToggle(product.id); }}
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
        })}
      </div>
    </div>
  );
}
