import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    ratings: 0,
  });

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);

  const [error, setError] = useState("");
  const [userError, setUserError] = useState("");
  const [storeError, setStoreError] = useState("");

  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  const [userSort, setUserSort] = useState({
    sortBy: "name",
    sortOrder: "asc",
  });

  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [storeSort, setStoreSort] = useState({
    sortBy: "name",
    sortOrder: "asc",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });

  const [storeOwners, setStoreOwners] = useState([]);

  const [userFormMessage, setUserFormMessage] = useState("");
  const [storeFormMessage, setStoreFormMessage] = useState("");

  const [userFormError, setUserFormError] = useState("");
  const [storeFormError, setStoreFormError] = useState("");

  const [userFormLoading, setUserFormLoading] = useState(false);
  const [storeFormLoading, setStoreFormLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserLoading, setSelectedUserLoading] =
    useState(false);
  const [selectedUserError, setSelectedUserError] =
    useState("");

  async function fetchStats() {
    const response = await api.get("/admin/dashboard");

    setStats({
      users: response.data.users,
      stores: response.data.stores,
      ratings: response.data.ratings,
    });
  }

  async function fetchUsers() {
    try {
      setUsersLoading(true);
      setUserError("");

      const response = await api.get("/admin/users", {
        params: {
          name: userFilters.name || undefined,
          email: userFilters.email || undefined,
          address: userFilters.address || undefined,
          role: userFilters.role || undefined,
          sortBy: userSort.sortBy,
          sortOrder: userSort.sortOrder,
        },
      });

      setUsers(response.data.users);
    } catch (error) {
      setUserError(
        error.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setUsersLoading(false);
    }
  }

  async function fetchStores() {
    try {
      setStoresLoading(true);
      setStoreError("");

      const response = await api.get("/admin/stores", {
        params: {
          name: storeFilters.name || undefined,
          email: storeFilters.email || undefined,
          address: storeFilters.address || undefined,
          sortBy: storeSort.sortBy,
          sortOrder: storeSort.sortOrder,
        },
      });

      setStores(response.data.stores);
    } catch (error) {
      setStoreError(
        error.response?.data?.message ||
          "Failed to load stores."
      );
    } finally {
      setStoresLoading(false);
    }
  }

  async function fetchStoreOwners() {
    try {
      const response = await api.get("/admin/users", {
        params: {
          role: "STORE_OWNER",
          sortBy: "name",
          sortOrder: "asc",
        },
      });

      setStoreOwners(response.data.users);
    } catch (error) {
      setStoreOwners([]);
    }
  }

  async function fetchAllData() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchStores(),
        fetchStoreOwners(),
      ]);
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
    fetchAllData();
  }, []);

  function handleUserFilterChange(event) {
    const { name, value } = event.target;

    setUserFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleStoreFilterChange(event) {
    const { name, value } = event.target;

    setStoreFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleUserSortChange(event) {
    const { name, value } = event.target;

    setUserSort((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleStoreSortChange(event) {
    const { name, value } = event.target;

    setStoreSort((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleUserFormChange(event) {
    const { name, value } = event.target;

    setUserForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleStoreFormChange(event) {
    const { name, value } = event.target;

    setStoreForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleUserSearch(event) {
    event.preventDefault();
    await fetchUsers();
  }

  async function handleStoreSearch(event) {
    event.preventDefault();
    await fetchStores();
  }

  function clearUserFilters() {
    const filters = {
      name: "",
      email: "",
      address: "",
      role: "",
    };

    setUserFilters(filters);

    setTimeout(() => {
      fetchUsers();
    }, 0);
  }

  function clearStoreFilters() {
    const filters = {
      name: "",
      email: "",
      address: "",
    };

    setStoreFilters(filters);

    setTimeout(() => {
      fetchStores();
    }, 0);
  }

  async function handleCreateUser(event) {
    event.preventDefault();

    setUserFormMessage("");
    setUserFormError("");
    setUserFormLoading(true);

    try {
      const response = await api.post(
        "/admin/users",
        userForm
      );

      setUserFormMessage(
        response.data.message ||
          "User created successfully."
      );

      setUserForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });

      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchStoreOwners(),
      ]);
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors?.length) {
        setUserFormError(
          validationErrors[0].message
        );
      } else {
        setUserFormError(
          error.response?.data?.message ||
            "Failed to create user."
        );
      }
    } finally {
      setUserFormLoading(false);
    }
  }

  async function handleCreateStore(event) {
    event.preventDefault();

    setStoreFormMessage("");
    setStoreFormError("");
    setStoreFormLoading(true);

    try {
      const response = await api.post(
        "/admin/stores",
        {
          ...storeForm,
          ownerId: Number(storeForm.ownerId),
        }
      );

      setStoreFormMessage(
        response.data.message ||
          "Store created successfully."
      );

      setStoreForm({
        name: "",
        email: "",
        address: "",
        ownerId: "",
      });

      await Promise.all([
        fetchStats(),
        fetchStores(),
      ]);
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors?.length) {
        setStoreFormError(
          validationErrors[0].message
        );
      } else {
        setStoreFormError(
          error.response?.data?.message ||
            "Failed to create store."
        );
      }
    } finally {
      setStoreFormLoading(false);
    }
  }

  async function handleUserDetails(userId) {
    try {
      setSelectedUserLoading(true);
      setSelectedUserError("");

      const response = await api.get(
        `/admin/users/${userId}`
      );

      setSelectedUser(response.data.user);
    } catch (error) {
      setSelectedUserError(
        error.response?.data?.message ||
          "Failed to load user details."
      );
    } finally {
      setSelectedUserLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <section className="loading-state dashboard-loading">
          <div className="loading-spinner"></div>
          <h2>Loading admin dashboard...</h2>
          <p>Please wait while we load your data.</p>
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
              <p>Administration panel</p>
            </div>
          </div>

          <div className="dashboard-user">
            <div className="dashboard-user-info">
              <span>Administrator</span>
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

      <main className="dashboard-main admin-main">
        <div className="dashboard-title">
          <div>
            <p className="page-eyebrow">
              ADMINISTRATION
            </p>

            <h2>Admin Dashboard</h2>

            <p>
              Manage users, stores, ratings, and platform
              data.
            </p>
          </div>
        </div>

        {error && (
          <div className="form-alert form-alert-error">
            {error}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">U</div>

            <div>
              <span>Total Users</span>
              <strong>{stats.users}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">S</div>

            <div>
              <span>Total Stores</span>
              <strong>{stats.stores}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">R</div>

            <div>
              <span>Total Ratings</span>
              <strong>{stats.ratings}</strong>
            </div>
          </div>
        </section>

        <section className="admin-form-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Add User</h3>
                <p>
                  Create a normal user, administrator, or
                  store owner.
                </p>
              </div>
            </div>

            <form
              className="admin-form"
              onSubmit={handleCreateUser}
            >
              <div className="form-field">
                <label htmlFor="userName">Name</label>

                <input
                  id="userName"
                  name="name"
                  type="text"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                  placeholder="Enter full name"
                  minLength={20}
                  maxLength={60}
                  required
                />

                <small>
                  20–60 characters.
                </small>
              </div>

              <div className="form-field">
                <label htmlFor="userEmail">
                  Email
                </label>

                <input
                  id="userEmail"
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="userPassword">
                  Password
                </label>

                <input
                  id="userPassword"
                  name="password"
                  type="password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  placeholder="Create password"
                  minLength={8}
                  maxLength={16}
                  required
                />

                <small>
                  8–16 characters, uppercase and special
                  character required.
                </small>
              </div>

              <div className="form-field">
                <label htmlFor="userAddress">
                  Address
                </label>

                <textarea
                  id="userAddress"
                  name="address"
                  value={userForm.address}
                  onChange={handleUserFormChange}
                  placeholder="Enter address"
                  maxLength={400}
                  rows={3}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="userRole">
                  Role
                </label>

                <select
                  id="userRole"
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                >
                  <option value="USER">
                    Normal User
                  </option>

                  <option value="ADMIN">
                    Administrator
                  </option>

                  <option value="STORE_OWNER">
                    Store Owner
                  </option>
                </select>
              </div>

              {userFormError && (
                <div className="form-alert form-alert-error">
                  {userFormError}
                </div>
              )}

              {userFormMessage && (
                <div className="form-alert form-alert-success">
                  {userFormMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={userFormLoading}
              >
                {userFormLoading
                  ? "Creating..."
                  : "Add User"}
              </button>
            </form>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Add Store</h3>
                <p>
                  Create a store and assign its owner.
                </p>
              </div>
            </div>

            <form
              className="admin-form"
              onSubmit={handleCreateStore}
            >
              <div className="form-field">
                <label htmlFor="storeName">
                  Store Name
                </label>

                <input
                  id="storeName"
                  name="name"
                  type="text"
                  value={storeForm.name}
                  onChange={handleStoreFormChange}
                  placeholder="Enter store name"
                  minLength={20}
                  maxLength={60}
                  required
                />

                <small>
                  20–60 characters.
                </small>
              </div>

              <div className="form-field">
                <label htmlFor="storeEmail">
                  Email
                </label>

                <input
                  id="storeEmail"
                  name="email"
                  type="email"
                  value={storeForm.email}
                  onChange={handleStoreFormChange}
                  placeholder="Enter store email"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="storeAddress">
                  Address
                </label>

                <textarea
                  id="storeAddress"
                  name="address"
                  value={storeForm.address}
                  onChange={handleStoreFormChange}
                  placeholder="Enter store address"
                  maxLength={400}
                  rows={3}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="storeOwner">
                  Store Owner
                </label>

                <select
                  id="storeOwner"
                  name="ownerId"
                  value={storeForm.ownerId}
                  onChange={handleStoreFormChange}
                  required
                >
                  <option value="">
                    Select Store Owner
                  </option>

                  {storeOwners.map((owner) => (
                    <option
                      key={owner.id}
                      value={owner.id}
                    >
                      {owner.name} - {owner.email}
                    </option>
                  ))}
                </select>
              </div>

              {storeFormError && (
                <div className="form-alert form-alert-error">
                  {storeFormError}
                </div>
              )}

              {storeFormMessage && (
                <div className="form-alert form-alert-success">
                  {storeFormMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={storeFormLoading}
              >
                {storeFormLoading
                  ? "Creating..."
                  : "Add Store"}
              </button>
            </form>
          </div>
        </section>

        <section className="dashboard-panel admin-data-panel">
          <div className="panel-header">
            <div>
              <h3>Stores</h3>
              <p>
                Search, filter, and sort registered stores.
              </p>
            </div>
          </div>

          <form
            className="admin-filter-grid"
            onSubmit={handleStoreSearch}
          >
            <div className="form-field">
              <label htmlFor="storeFilterName">
                Name
              </label>

              <input
                id="storeFilterName"
                name="name"
                placeholder="Store name"
                value={storeFilters.name}
                onChange={handleStoreFilterChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="storeFilterEmail">
                Email
              </label>

              <input
                id="storeFilterEmail"
                name="email"
                placeholder="Email"
                value={storeFilters.email}
                onChange={handleStoreFilterChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="storeFilterAddress">
                Address
              </label>

              <input
                id="storeFilterAddress"
                name="address"
                placeholder="Address"
                value={storeFilters.address}
                onChange={handleStoreFilterChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="storeSortBy">
                Sort By
              </label>

              <select
                id="storeSortBy"
                name="sortBy"
                value={storeSort.sortBy}
                onChange={handleStoreSortChange}
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="address">Address</option>
                <option value="createdAt">
                  Created Date
                </option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="storeSortOrder">
                Order
              </label>

              <select
                id="storeSortOrder"
                name="sortOrder"
                value={storeSort.sortOrder}
                onChange={handleStoreSortChange}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="filter-actions">
              <button type="submit">Search</button>

              <button
                className="secondary-button"
                type="button"
                onClick={clearStoreFilters}
              >
                Clear
              </button>
            </div>
          </form>

          {storeError && (
            <div className="form-alert form-alert-error">
              {storeError}
            </div>
          )}

          {storesLoading ? (
            <div className="table-loading">
              <div className="loading-spinner"></div>
              <p>Loading stores...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="table-empty">
              No stores found.
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
                  </tr>
                </thead>

                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id}>
                      <td className="table-primary">
                        {store.name}
                      </td>

                      <td>{store.email}</td>

                      <td>{store.address}</td>

                      <td>
                        <span className="rating-badge">
                          {store.averageRating > 0
                            ? `${store.averageRating} / 5`
                            : "No ratings"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-panel admin-data-panel">
          <div className="panel-header">
            <div>
              <h3>Users</h3>
              <p>
                Search users by name, email, address, or
                role.
              </p>
            </div>
          </div>

          <form
            className="admin-filter-grid"
            onSubmit={handleUserSearch}
          >
            <div className="form-field">
              <label htmlFor="userFilterName">
                Name
              </label>

              <input
                id="userFilterName"
                name="name"
                placeholder="Name"
                value={userFilters.name}
                onChange={handleUserFilterChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="userFilterEmail">
                Email
              </label>

              <input
                id="userFilterEmail"
                name="email"
                placeholder="Email"
                value={userFilters.email}
                onChange={handleUserFilterChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="userFilterAddress">
                Address
              </label>

              <input
                id="userFilterAddress"
                name="address"
                placeholder="Address"
                value={userFilters.address}
                onChange={handleUserFilterChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="userFilterRole">
                Role
              </label>

              <select
                id="userFilterRole"
                name="role"
                value={userFilters.role}
                onChange={handleUserFilterChange}
              >
                <option value="">All Roles</option>
                <option value="USER">
                  Normal User
                </option>
                <option value="ADMIN">
                  Administrator
                </option>
                <option value="STORE_OWNER">
                  Store Owner
                </option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="userSortBy">
                Sort By
              </label>

              <select
                id="userSortBy"
                name="sortBy"
                value={userSort.sortBy}
                onChange={handleUserSortChange}
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="address">Address</option>
                <option value="role">Role</option>
                <option value="createdAt">
                  Created Date
                </option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="userSortOrder">
                Order
              </label>

              <select
                id="userSortOrder"
                name="sortOrder"
                value={userSort.sortOrder}
                onChange={handleUserSortChange}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="filter-actions">
              <button type="submit">Search</button>

              <button
                className="secondary-button"
                type="button"
                onClick={clearUserFilters}
              >
                Clear
              </button>
            </div>
          </form>

          {userError && (
            <div className="form-alert form-alert-error">
              {userError}
            </div>
          )}

          {usersLoading ? (
            <div className="table-loading">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="table-empty">
              No users found.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td className="table-primary">
                        {item.name}
                      </td>

                      <td>{item.email}</td>

                      <td>{item.address}</td>

                      <td>
                        <span
                          className={`role-badge role-${item.role.toLowerCase()}`}
                        >
                          {item.role === "USER"
                            ? "Normal User"
                            : item.role ===
                              "STORE_OWNER"
                            ? "Store Owner"
                            : "Administrator"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="small-button"
                          type="button"
                          onClick={() =>
                            handleUserDetails(item.id)
                          }
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-panel user-details-panel">
          <div className="panel-header">
            <div>
              <h3>User Details</h3>
              <p>
                Select a user from the table to view their
                details.
              </p>
            </div>
          </div>

          {selectedUserLoading && (
            <div className="table-loading">
              <div className="loading-spinner"></div>
              <p>Loading user details...</p>
            </div>
          )}

          {selectedUserError && (
            <div className="form-alert form-alert-error">
              {selectedUserError}
            </div>
          )}

          {!selectedUserLoading &&
            !selectedUserError &&
            !selectedUser && (
              <div className="details-placeholder">
                Select "View Details" for a user above.
              </div>
            )}

          {!selectedUserLoading &&
            !selectedUserError &&
            selectedUser && (
              <div className="user-details-grid">
                <div className="detail-item">
                  <span>Name</span>
                  <strong>{selectedUser.name}</strong>
                </div>

                <div className="detail-item">
                  <span>Email</span>
                  <strong>{selectedUser.email}</strong>
                </div>

                <div className="detail-item">
                  <span>Address</span>
                  <strong>{selectedUser.address}</strong>
                </div>

                <div className="detail-item">
                  <span>Role</span>
                  <strong>
                    {selectedUser.role === "USER"
                      ? "Normal User"
                      : selectedUser.role ===
                        "STORE_OWNER"
                      ? "Store Owner"
                      : "Administrator"}
                  </strong>
                </div>

                {selectedUser.role ===
                  "STORE_OWNER" &&
                  selectedUser.ownedStore && (
                    <>
                      <div className="detail-item">
                        <span>Store</span>
                        <strong>
                          {
                            selectedUser.ownedStore
                              .name
                          }
                        </strong>
                      </div>

                      <div className="detail-item">
                        <span>Average Rating</span>
                        <strong>
                          {selectedUser.averageRating >
                          0
                            ? `${selectedUser.averageRating} / 5`
                            : "No ratings"}
                        </strong>
                      </div>
                    </>
                  )}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;