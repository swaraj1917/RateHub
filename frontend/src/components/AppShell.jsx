import { Link } from "react-router-dom";

import Brand from "./Brand";
import { useAuth } from "../context/AuthContext";
import { roleLabels } from "../utils/validators";

const homeByRole = { ADMIN: "/admin", STORE_OWNER: "/owner", USER: "/user" };

export default function AppShell({ children, narrow = false }) {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Brand to={homeByRole[user?.role] || "/"} />

          <div className="topbar-actions">
            <div className="whoami">
              <span className="name">{user?.name}</span>
              <span className="role-badge">{roleLabels[user?.role]}</span>
            </div>
            <Link to="/change-password" className="btn btn-secondary btn-small">
              Password
            </Link>
            <button type="button" className="btn btn-secondary btn-small" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className={`page${narrow ? " page-narrow" : ""}`}>{children}</main>
    </>
  );
}
