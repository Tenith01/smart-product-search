import { useState } from 'react';
import { useSearch } from './hooks/useSearch';
import { SearchBar } from './components/SearchBar';
import { MegaMenu } from './components/MegaMenu/MegaMenu';
import './App.css';

function App() {
  const { query, setQuery, results, loading } = useSearch();
  const [menuFocusedIndex, setMenuFocusedIndex] = useState(-1);

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
        alert(`Navigating to: ${results.topResults[menuFocusedIndex].name}`);
      }
    } else if (e.key === 'Escape') {
      setMenuFocusedIndex(-1);
    }
  };

  const handleSearchChange = (val: string) => {
    setQuery(val);
    setMenuFocusedIndex(-1);
  };

  const showMegaMenu = query.trim() && results;

  return (
    <div className="app-container">
      <div className="search-widget">
        <SearchBar 
          value={query} 
          onChange={handleSearchChange}
          loading={loading}
          onKeyDown={handleKeyDown}
        />
        {showMegaMenu && (
          <MegaMenu 
            results={results}
            focusedIndex={menuFocusedIndex}
            onHover={setMenuFocusedIndex}
          />
        )}
      </div>
    </div>
  );
}

export default App;
