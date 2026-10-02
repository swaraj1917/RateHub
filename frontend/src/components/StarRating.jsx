function Star({ on }) {
  return (
    <svg className={`star${on ? " on" : ""}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
    </svg>
  );
}

// Read-only stars. Supports decimals by rounding to the nearest whole star.
export function StarDisplay({ value, large = false, showNumber = true }) {
  const rounded = Math.round(value || 0);

  if (!value) {
    return <span className="rating-none">No ratings yet</span>;
  }

  return (
    <span
      className={`stars${large ? " star-lg" : ""}`}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} on={n <= rounded} />
      ))}
      {showNumber && <span className="rating-value">{Number(value).toFixed(1)}</span>}
    </span>
  );
}

// Interactive picker used when a customer rates a store.
export function StarPicker({ value, onChange, disabled = false, label }) {
  return (
    <div className="star-picker" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          disabled={disabled}
          onClick={() => onChange(n)}
        >
          <Star on={n <= (value || 0)} />
        </button>
      ))}
    </div>
  );
}
