import type { SearchResponse, ProductResult } from '../../types/product';
import { TopResults } from './TopResults';
import { CategoryColumn } from './CategoryColumn';

interface MegaMenuProps {
  results: SearchResponse;
  query: string;
  focusedIndex: number;
  onHover: (index: number) => void;
  onSelect: (product: ProductResult) => void;
  loading?: boolean;
}

export function MegaMenu({ results, query, focusedIndex, onHover, onSelect, loading }: MegaMenuProps) {
  if (results.totalCount === 0) {
    return (
      <div className="mega-menu empty-state">
        <div className="empty-message">
          <div className="empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p>No results for &ldquo;{results.query}&rdquo;</p>
          <p className="empty-sub">Try a different search term or check your spelling.</p>
        </div>
      </div>
    );
  }

  const categories = Object.keys(results.byCategory);

  return (
    <div className={`mega-menu${loading ? ' mega-menu-loading' : ''}`}>
      {results.typoDetected && (
        <div className="typo-banner">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          <span>
            Showing results for <span className="typo-corrected">{results.correctedQuery}</span>
          </span>
        </div>
      )}

      <div className="results-header">
        <span className="results-count">
          <strong>{results.totalCount}</strong> result{results.totalCount !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className="mega-menu-body">
        <div className="mega-menu-columns">
          <div className="left-column">
            <TopResults
              results={results.topResults}
              query={query}
              focusedIndex={focusedIndex}
              onHover={onHover}
              onSelect={onSelect}
            />
          </div>
          {categories.length > 0 && (
            <div className="right-column">
              {categories.map(cat => (
                <CategoryColumn
                  key={cat}
                  category={cat}
                  products={results.byCategory[cat]}
                  query={query}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
