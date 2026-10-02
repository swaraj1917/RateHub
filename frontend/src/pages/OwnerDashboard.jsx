import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function OwnerDashboard() {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/owner/dashboard");

      setDashboard(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <section className="loading-state dashboard-loading">
          <div className="loading-spinner"></div>
          <h2>Loading store dashboard...</h2>
          <p>Please wait while we load your store data.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-brand">
            <div className="brand-mark dashboard-brand-mark">
              R
            </div>

            <div>
              <h1>RateHub</h1>
              <p>Store owner portal</p>
            </div>
          </div>

          <div className="dashboard-user">
            <div className="dashboard-user-info">
              <span>Store Owner</span>
              <strong>{user?.name}</strong>
            </div>

            <Link
              className="header-link"
              to="/change-password"
            >
              Change Password
            </Link>

            <button
              className="secondary-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main owner-main">
        <div className="dashboard-title">
          <div>
            <p className="page-eyebrow">
              STORE MANAGEMENT
            </p>

            <h2>Store Owner Dashboard</h2>

            <p>
              Monitor your store information and customer
              ratings.
            </p>
          </div>
        </div>

        {error && (
          <div className="form-alert form-alert-error">
            {error}
          </div>
        )}

        {!error && dashboard && (
          <>
            <section className="owner-summary-grid">
              <div className="owner-store-card">
                <div className="owner-store-icon">
                  {dashboard.store.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <span className="card-eyebrow">
                    YOUR STORE
                  </span>

                  <h3>{dashboard.store.name}</h3>

                  <p>{dashboard.store.email}</p>

                  <p>{dashboard.store.address}</p>
                </div>
              </div>

              <div className="owner-stat-card">
                <span>Average Rating</span>

                <strong>
                  {dashboard.averageRating > 0
                    ? dashboard.averageRating
                    : "—"}
                </strong>

                <small>
                  {dashboard.averageRating > 0
                    ? "out of 5"
                    : "No ratings yet"}
                </small>
              </div>

              <div className="owner-stat-card">
                <span>Users Who Rated</span>

                <strong>
                  {dashboard.totalUsersRated}
                </strong>

                <small>
                  {dashboard.totalUsersRated === 1
                    ? "customer rating"
                    : "customer ratings"}
                </small>
              </div>
            </section>

            <section className="dashboard-panel owner-store-details">
              <div className="panel-header">
                <div>
                  <h3>Store Information</h3>
                  <p>
                    Details associated with your RateHub
                    store.
                  </p>
                </div>
              </div>

              <div className="owner-details-grid">
                <div className="detail-item">
                  <span>Store Name</span>
                  <strong>
                    {dashboard.store.name}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Email</span>
                  <strong>
                    {dashboard.store.email}
                  </strong>
                </div>

                <div className="detail-item owner-address-detail">
                  <span>Address</span>
                  <strong>
                    {dashboard.store.address}
                  </strong>
                </div>
              </div>
            </section>

            <section className="dashboard-panel owner-ratings-panel">
              <div className="panel-header">
                <div>
                  <h3>Customer Ratings</h3>
                  <p>
                    Users who have submitted a rating for
                    your store.
                  </p>
                </div>

                <div className="panel-count">
                  {dashboard.totalUsersRated}{" "}
                  {dashboard.totalUsersRated === 1
                    ? "rating"
                    : "ratings"}
                </div>
              </div>

              {dashboard.users.length === 0 ? (
                <div className="table-empty">
                  <div className="empty-state-icon">
                    R
                  </div>

                  <strong>No ratings yet</strong>

                  <p>
                    Customer ratings will appear here once
                    users rate your store.
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Rating</th>
                        <th>Rated At</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboard.users.map((ratedUser) => (
                        <tr key={ratedUser.userId}>
                          <td className="table-primary">
                            {ratedUser.name}
                          </td>

                          <td>
                            {ratedUser.email}
                          </td>

                          <td>
                            {ratedUser.address}
                          </td>

                          <td>
                            <span className="rating-badge">
                              {ratedUser.rating} / 5
                            </span>
                          </td>

                          <td>
                            {new Date(
                              ratedUser.ratedAt
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default OwnerDashboard;