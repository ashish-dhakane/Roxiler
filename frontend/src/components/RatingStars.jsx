import { useState } from 'react';

export default function RatingStars({ rating, onRate, readonly = false, showValue = true }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          ★
        </button>
      ))}
      {showValue && <span className="rating-value">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>}
    </div>
  );
}
