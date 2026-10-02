import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ChangePassword() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put("/auth/password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage(
        response.data.message ||
          "Password updated successfully."
      );

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors?.length) {
        setError(validationErrors[0].message);
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to update password."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "STORE_OWNER"
      ? "/owner"
      : "/user";

  return (
    <main className="password-page">
      <section className="password-card">
        <div className="password-header">
          <div className="brand-mark password-brand-mark">
            R
          </div>

          <p className="page-eyebrow">
            ACCOUNT SECURITY
          </p>

          <h1>Change Password</h1>

          <p>
            Update the password associated with your
            RateHub account.
          </p>
        </div>

        <div className="password-account">
          <span>Account</span>
          <strong>{user?.email}</strong>
        </div>

        <form
          className="password-form"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <label htmlFor="currentPassword">
              Current Password
            </label>

            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="newPassword">
              New Password
            </label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              minLength={8}
              maxLength={16}
              autoComplete="new-password"
              required
            />

            <small>
              8–16 characters, with at least one uppercase
              letter and one special character.
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              minLength={8}
              maxLength={16}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div className="form-alert form-alert-error">
              {error}
            </div>
          )}

          {message && (
            <div className="form-alert form-alert-success">
              {message}
            </div>
          )}

          <button
            className="password-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>

        <div className="password-footer">
          <Link to={dashboardPath}>
            Return to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ChangePassword;