import { useState, useCallback } from 'react';
import { useSearch } from './hooks/useSearch';
import { SearchBar } from './components/SearchBar';
import { MegaMenu } from './components/MegaMenu/MegaMenu';
import { ProductDetail } from './components/ProductDetail';
import type { ProductResult } from './types/product';
import './App.css';

function App() {
  const { query, setQuery, results, loading, error } = useSearch();
  const [menuFocusedIndex, setMenuFocusedIndex] = useState(-1);
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results || results.totalCount === 0) return;

    const maxIndex = results.topResults.length - 1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMenuFocusedIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMenuFocusedIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (menuFocusedIndex >= 0 && menuFocusedIndex < results.topResults.length) {
        setSelectedProduct(results.topResults[menuFocusedIndex]);
      }
    } else if (e.key === 'Escape') {
      setMenuFocusedIndex(-1);
    }
  };

  const handleSearchChange = (val: string) => {
    setQuery(val);
    setMenuFocusedIndex(-1);
  };

  const handleCloseDetail = useCallback(() => setSelectedProduct(null), []);

  const hasQuery = query.trim().length > 0;
  const showMegaMenu = hasQuery && results;
  const showSkeleton = hasQuery && loading && !results;

  return (
    <div className="app-container">
      <div className={`search-widget${hasQuery ? ' active' : ''}`}>

        {!hasQuery && (
          <div className="landing-content">
            <div className="landing-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h1 className="landing-title">Smart Product Search</h1>
            <p className="landing-subtitle">Find exactly what you're looking for</p>
          </div>
        )}

        <SearchBar
          value={query}
          onChange={handleSearchChange}
          loading={loading}
          onKeyDown={handleKeyDown}
        />

        {showSkeleton && (
          <div className="mega-menu" style={{ marginTop: 8 }}>
            <div className="skeleton-container">
              <div className="skeleton-columns">
                <div className="skeleton-column">
                  <div className="skeleton-label" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-card">
                      <div className="skeleton-line full" />
                      <div className="skeleton-line medium" />
                    </div>
                  ))}
                </div>
                <div className="skeleton-column">
                  <div className="skeleton-label" />
                  {[1, 2].map((i) => (
                    <div key={i} className="skeleton-card">
                      <div className="skeleton-line medium" />
                      <div className="skeleton-line short" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && !results && (
          <div className="error-banner">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="error-text">{error}</span>
          </div>
        )}

        {showMegaMenu && (
          <MegaMenu
            results={results}
            query={query}
            focusedIndex={menuFocusedIndex}
            onHover={setMenuFocusedIndex}
            onSelect={setSelectedProduct}
            loading={loading}
          />
        )}

        {showMegaMenu && (
          <div className="keyboard-hints">
            <span className="keyboard-hint">
              <span className="kbd">↑</span><span className="kbd">↓</span> navigate
            </span>
            <span className="keyboard-hint">
              <span className="kbd">Enter</span> select
            </span>
            <span className="keyboard-hint">
              <span className="kbd">Esc</span> close
            </span>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

export default App;
