import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function UserDashboard() {
  const { user, logout } = useAuth();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState({
    name: "",
    address: "",
  });

  const [sort, setSort] = useState({
    sortBy: "name",
    sortOrder: "asc",
  });

  const [selectedRatings, setSelectedRatings] = useState({});
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingLoading, setRatingLoading] = useState({});

  async function fetchStores() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/user/stores", {
        params: {
          name: search.name || undefined,
          address: search.address || undefined,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
        },
      });

      const fetchedStores = response.data.stores;

      setStores(fetchedStores);

      setSelectedRatings((previous) => {
        const ratings = {};

        fetchedStores.forEach((store) => {
          if (store.userRating !== null) {
            ratings[store.id] = store.userRating;
          } else if (previous[store.id] !== undefined) {
            ratings[store.id] = previous[store.id];
          }
        });

        return ratings;
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load stores."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStores();
  }, []);

  function handleSearchChange(event) {
    const { name, value } = event.target;

    setSearch((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    setRatingMessage("");

    fetchStores();
  }

  function handleClearSearch() {
    setSearch({
      name: "",
      address: "",
    });

    setTimeout(() => {
      fetchStores();
    }, 0);
  }

  function handleSortChange(event) {
    const { name, value } = event.target;

    setSort((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSortSubmit(event) {
    event.preventDefault();

    setRatingMessage("");

    fetchStores();
  }

  function handleRatingChange(storeId, rating) {
    setSelectedRatings((previous) => ({
      ...previous,
      [storeId]: Number(rating),
    }));

    setRatingMessage("");
  }

  async function handleRatingSubmit(store) {
    const rating = selectedRatings[store.id];

    if (
      !rating ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      setRatingMessage(
        "Please select a rating between 1 and 5."
      );

      return;
    }

    try {
      setRatingMessage("");

      setRatingLoading((previous) => ({
        ...previous,
        [store.id]: true,
      }));

      if (store.userRating === null) {
        await api.post(
          `/user/stores/${store.id}/rating`,
          {
            rating,
          }
        );
      } else {
        await api.put(
          `/user/stores/${store.id}/rating`,
          {
            rating,
          }
        );
      }

      setRatingMessage(
        store.userRating === null
          ? "Rating submitted successfully."
          : "Rating updated successfully."
      );

      await fetchStores();
    } catch (error) {
      setRatingMessage(
        error.response?.data?.message ||
          "Failed to save rating."
      );
    } finally {
      setRatingLoading((previous) => ({
        ...previous,
        [store.id]: false,
      }));
    }
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
              <p>Store ratings platform</p>
            </div>
          </div>

          <div className="dashboard-user">
            <div className="dashboard-user-info">
              <span>Signed in as</span>
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

      <main className="dashboard-main">
        <div className="dashboard-title">
          <div>
            <p className="page-eyebrow">USER DASHBOARD</p>

            <h2>Find and rate stores</h2>

            <p>
              Search stores, see their overall ratings, and
              share your experience.
            </p>
          </div>

          <div className="store-count">
            <span>Stores found</span>
            <strong>{stores.length}</strong>
          </div>
        </div>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Search stores</h3>
              <p>
                Find stores by name or address.
              </p>
            </div>
          </div>

          <form
            className="search-form"
            onSubmit={handleSearchSubmit}
          >
            <div className="form-field">
              <label htmlFor="storeSearchName">
                Store Name
              </label>

              <input
                id="storeSearchName"
                name="name"
                type="text"
                placeholder="Search by store name"
                value={search.name}
                onChange={handleSearchChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="storeSearchAddress">
                Address
              </label>

              <input
                id="storeSearchAddress"
                name="address"
                type="text"
                placeholder="Search by address"
                value={search.address}
                onChange={handleSearchChange}
              />
            </div>

            <div className="search-actions">
              <button type="submit">
                Search
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={handleClearSearch}
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Sort results</h3>
              <p>
                Choose how you want the stores to be ordered.
              </p>
            </div>
          </div>

          <form
            className="sort-form"
            onSubmit={handleSortSubmit}
          >
            <div className="form-field">
              <label htmlFor="sortBy">Sort By</label>

              <select
                id="sortBy"
                name="sortBy"
                value={sort.sortBy}
                onChange={handleSortChange}
              >
                <option value="name">
                  Store Name
                </option>

                <option value="address">
                  Address
                </option>

                <option value="createdAt">
                  Created Date
                </option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="sortOrder">Order</label>

              <select
                id="sortOrder"
                name="sortOrder"
                value={sort.sortOrder}
                onChange={handleSortChange}
              >
                <option value="asc">
                  Ascending
                </option>

                <option value="desc">
                  Descending
                </option>
              </select>
            </div>

            <div className="sort-action">
              <button type="submit">
                Apply Sorting
              </button>
            </div>
          </form>
        </section>

        {ratingMessage && (
          <div className="form-alert form-alert-success">
            {ratingMessage}
          </div>
        )}

        {error && (
          <div className="form-alert form-alert-error">
            {error}
          </div>
        )}

        {loading && (
          <section className="dashboard-panel loading-state">
            <div className="loading-spinner"></div>
            <p>Loading stores...</p>
          </section>
        )}

        {!loading &&
          !error &&
          stores.length === 0 && (
            <section className="dashboard-panel empty-state">
              <div className="empty-icon">⌕</div>

              <h3>No stores found</h3>

              <p>
                Try changing your search criteria and search
                again.
              </p>
            </section>
          )}

        {!loading &&
          !error &&
          stores.length > 0 && (
            <section className="store-section">
              <div className="section-heading">
                <div>
                  <h3>Available stores</h3>
                  <p>
                    Rate stores based on your experience.
                  </p>
                </div>
              </div>

              <div className="store-grid">
                {stores.map((store) => {
                  const hasRating =
                    store.userRating !== null;

                  const currentSelection =
                    selectedRatings[store.id];

                  return (
                    <article
                      className="store-card"
                      key={store.id}
                    >
                      <div className="store-card-header">
                        <div className="store-icon">
                          {store.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="store-title">
                          <h3>{store.name}</h3>

                          <p>{store.address}</p>
                        </div>
                      </div>

                      <div className="rating-summary">
                        <div className="rating-item">
                          <span>Overall Rating</span>

                          <strong>
                            {store.overallRating > 0
                              ? `${store.overallRating} / 5`
                              : "No ratings yet"}
                          </strong>
                        </div>

                        <div className="rating-divider"></div>

                        <div className="rating-item">
                          <span>Your Rating</span>

                          <strong>
                            {hasRating
                              ? `${store.userRating} / 5`
                              : "Not rated"}
                          </strong>
                        </div>
                      </div>

                      <div className="store-rating-form">
                        <div className="form-field">
                          <label
                            htmlFor={`rating-${store.id}`}
                          >
                            {hasRating
                              ? "Change your rating"
                              : "Give your rating"}
                          </label>

                          <select
                            id={`rating-${store.id}`}
                            value={
                              currentSelection || ""
                            }
                            onChange={(event) =>
                              handleRatingChange(
                                store.id,
                                event.target.value
                              )
                            }
                          >
                            <option value="">
                              Select rating
                            </option>

                            <option value="1">
                              1 - Very Poor
                            </option>

                            <option value="2">
                              2 - Poor
                            </option>

                            <option value="3">
                              3 - Average
                            </option>

                            <option value="4">
                              4 - Good
                            </option>

                            <option value="5">
                              5 - Excellent
                            </option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRatingSubmit(store)
                          }
                          disabled={
                            ratingLoading[store.id]
                          }
                        >
                          {ratingLoading[store.id]
                            ? "Saving..."
                            : hasRating
                            ? "Modify Rating"
                            : "Submit Rating"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
      </main>
    </div>
  );
}

export default UserDashboard;