import Brand from "./Brand";
import { StarDisplay } from "./StarRating";

const samples = [
  { name: "Rajpur Road Coffee Roasters", addr: "Dehradun, Uttarakhand", rating: 4.8 },
  { name: "Paltan Bazaar Fresh Grocers", addr: "Dehradun, Uttarakhand", rating: 4.2 },
  { name: "Mussoorie Road Books", addr: "Dehradun, Uttarakhand", rating: 4.5 },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Brand />

        <div>
          <h1>Honest ratings for the stores around you.</h1>
          <p className="lead">
            Rate any store from 1 to 5, change your mind later, and see how everyone else
            scored it.
          </p>
        </div>

        <div className="sample-stores" aria-hidden="true">
          {samples.map((store) => (
            <div className="sample-store" key={store.name}>
              <div>
                <strong>{store.name}</strong>
                <span className="addr">{store.addr}</span>
              </div>
              <StarDisplay value={store.rating} showNumber />
            </div>
          ))}
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="sub">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
