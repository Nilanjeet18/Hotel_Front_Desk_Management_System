import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import RoomList from "./pages/RoomList";
import BookingForm from "./pages/BookingForm";
import BookingSummary from "./pages/BookingSummary";
import BookingConfirmation from "./pages/BookingConfirmation";
import AdminDashboard from "./pages/AdminDashboard";
import ManageBookings from "./pages/managebookings";
import ReceptionBookings from "./pages/ReceptionBookings";
import Users from "./components/Users";
import Login from "./pages/Login";

import "./App.css";

/* ── Icons ── */
const HotelIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("role")?.toUpperCase();
  const username = localStorage.getItem("username") || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("customerId");

    setIsLoggedIn(false);

    alert("Logged out successfully");
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/rooms", label: "Rooms" },

    // ✅ Only Receptionist books rooms — Admin doesn't book, per requirements
    ...(role === "RECEPTIONIST"
      ? [{ to: "/booking", label: "Book Room" }]
      : []),

    ...(role === "ADMIN" || role === "MANAGER"
      ? [{ to: "/manage-bookings", label: "Manage Bookings" }]
      : []),

    // ✅ Manager gets read-only access to the same stats/charts
    //    (Occupancy Report, Revenue Report, Hotel Statistics)
    ...(role === "MANAGER"
      ? [{ to: "/reports", label: "Reports" }]
      : []),

    // ✅ Receptionist gets their own scoped Update/Cancel page
    ...(role === "RECEPTIONIST"
      ? [{ to: "/reception/bookings", label: "Manage Bookings" }]
      : []),
  ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="navbar-brand"
        style={{ textDecoration: "none" }}
      >
        <HotelIcon />
        Hotel Hub
      </Link>

      <div className="navbar-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link${isActive(link.to) ? " active" : ""}`}
          >
            {link.label}
          </Link>
        ))}

        {isLoggedIn ? (
          <>
            {role === "ADMIN" && (
              <>
                <Link
                  to="/admin"
                  className={`nav-link${
                    isActive("/admin") && !isActive("/admin/staff") ? " active" : ""
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/admin/staff"
                  className={`nav-link${
                    isActive("/admin/staff") ? " active" : ""
                  }`}
                >
                  Manage Staff
                </Link>
              </>
            )}

            <span
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "13px",
                padding: "0 4px",
                alignSelf: "center",
              }}
            >
              Hi,{" "}
              <strong style={{ color: "#febb02" }}>
                {username}
              </strong>
            </span>

            <button
              onClick={handleLogout}
              className="btn btn-danger nav-logout"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className={`nav-link${
              isActive("/login") ? " active" : ""
            }`}
          >
            Login
          </Link>
          /* ⚠️ Public "Register" link removed — /api/users/register is
             now ADMIN-only. Staff accounts are created from
             Admin Dashboard → "Manage Staff" instead. */
        )}
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────── */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const role = localStorage.getItem("role")?.toUpperCase();

  return (
    <BrowserRouter>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />

          <Route path="/rooms" element={<RoomList />} />

          <Route
            path="/booking-summary"
            element={<BookingSummary />}
          />

          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />

          <Route
            path="/booking"
            element={
              !isLoggedIn ? (
                <Navigate to="/login" />
              ) : role === "RECEPTIONIST" ? (
                // ✅ Admin excluded — Admin does not create bookings
                <BookingForm />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/manage-bookings"
            element={
              !isLoggedIn ? (
                <Navigate to="/login" />
              ) : role === "ADMIN" ||
                role === "MANAGER" ? (
                <ManageBookings />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* ✅ NEW — Receptionist's own booking update/cancel page */}
          <Route
            path="/reception/bookings"
            element={
              !isLoggedIn ? (
                <Navigate to="/login" />
              ) : role === "RECEPTIONIST" ? (
                <ReceptionBookings />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/admin"
            element={
              !isLoggedIn ? (
                <Navigate to="/login" />
              ) : role === "ADMIN" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* ✅ NEW — Manager's read-only Reports/Stats page
              (same component as Admin's dashboard — it has no
              add/edit/delete actions in it, just charts + stats) */}
          <Route
            path="/reports"
            element={
              !isLoggedIn ? (
                <Navigate to="/login" />
              ) : role === "MANAGER" || role === "ADMIN" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* ✅ NEW — Staff management, Admin only */}
          <Route
            path="/admin/staff"
            element={
              !isLoggedIn ? (
                <Navigate to="/login" />
              ) : role === "ADMIN" ? (
                <Users />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/login"
            element={
              <Login setIsLoggedIn={setIsLoggedIn} />
            }
          />

          {/* ⚠️ Public /register route removed. Register.jsx is now
              unused unless you want to repurpose it — see note below. */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;