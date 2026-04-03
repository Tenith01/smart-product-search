import { useState } from 'react';
import type { SearchResponse } from '../../types/product';
import { TopResults } from './TopResults';
import { CategoryColumn } from './CategoryColumn';

interface MegaMenuProps {
  results: SearchResponse;
  focusedIndex: number;
  onHover: (index: number) => void;
}

export function MegaMenu({ results, focusedIndex, onHover }: MegaMenuProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (results.totalCount === 0) {
    return (
      <div className="mega-menu empty-state">
        <div className="empty-message">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>We couldn't find any products matching "{results.query}".</p>
          <p className="empty-sub">Try checking your spelling or use more general terms.</p>
        </div>
      </div>
    );
  }

  // Find the dominant category for the right column
  const categories = Object.keys(results.byCategory);
  const dominantCategory = categories.length > 0 ? categories[0] : null;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="mega-menu">
      <div className="mega-menu-columns">
        <div className="left-column">
          <TopResults 
            results={results.topResults} 
            focusedIndex={focusedIndex}
            expandedId={expandedId}
            onToggle={toggleExpand}
            onHover={onHover}
          />
        </div>
        
        {dominantCategory && (
          <div className="right-column">
             <CategoryColumn 
              category={dominantCategory} 
              products={results.byCategory[dominantCategory]}
              expandedId={expandedId}
              onToggle={toggleExpand}
            />
          </div>
        )}
      </div>
    </div>
  );
}
