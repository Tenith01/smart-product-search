
export function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;

  // Split on query terms, case insensitive
  const terms = query.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <span>{text}</span>;

  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = terms.some((t) => t.toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <strong key={i} className="text-highlight">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
}
