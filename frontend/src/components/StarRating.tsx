interface StarRatingProps {
  rating: number;
  className?: string;
}

export function StarRating({ rating, className = '' }: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, rating));

  return (
    <span
      className={`stars-container stars-by-slot${className ? ` ${className}` : ''}`}
      aria-hidden
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, clamped - i));
        return (
          <span key={i} className="star-slot">
            <span className="star-slot-bg">★</span>
            <span className="star-slot-fill" style={{ width: `${fill * 100}%` }}>
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}
