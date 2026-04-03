interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function SearchBar({ value, onChange, loading, onFocus, onBlur, onKeyDown }: SearchBarProps) {
  return (
    <div className="search-bar-container">
      {loading ? (
        <div className="search-spinner" />
      ) : (
        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      )}
      <input
        type="text"
        className="search-input"
        placeholder="Search for products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck="false"
        autoFocus
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange('')}
          type="button"
          aria-label="Clear search"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
