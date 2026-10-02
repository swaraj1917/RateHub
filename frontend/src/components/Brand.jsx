import { Link } from "react-router-dom";

export function StarGlyph({ size = 18, color = "#f2a20c" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={color}
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
      />
    </svg>
  );
}

export default function Brand({ to = "/" }) {
  return (
    <Link to={to} className="brand">
      <span className="brand-mark">
        <StarGlyph />
      </span>
      RateHub
    </Link>
  );
}
