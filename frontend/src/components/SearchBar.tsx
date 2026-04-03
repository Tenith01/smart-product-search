interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function SearchBar({ value, onChange, onFocus, onBlur, onKeyDown }: SearchBarProps) {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder=""
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
}
