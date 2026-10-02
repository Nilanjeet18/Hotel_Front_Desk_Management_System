import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import RoomList from "./pages/RoomList";
import BookingForm from "./pages/BookingForm";
import BookingSummary from "./pages/BookingSummary";
import BookingConfirmation from "./pages/BookingConfirmation";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔐 token check
  const token = localStorage.getItem("token");

  // 🚪 logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully");
    navigate("/login");
  };

  const links = [
    { to: "/", label: "🏠 Home" },
    { to: "/about", label: "ℹ️ About" },
    { to: "/rooms", label: "🛏 Rooms" },
    { to: "/booking", label: "📅 Book Room" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">🏨 Hotel App</div>

      <div className="navbar-links">

        {/* 🔗 Common Links */}
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={
              location.pathname === link.to
                ? "nav-link active"
                : "nav-link"
            }
          >
            {link.label}
          </Link>
        ))}

        {/* 🔥 Admin only (optional) */}
        {token && (
          <Link to="/admin" className="nav-link">
            ⚙️ Dashboard
          </Link>
        )}

        {/* 🔥 Auth Logic */}
        {token ? (
          <button onClick={handleLogout} className="btn btn-danger">
            🚪 Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="nav-link">🔐 Login</Link>
            <Link to="/register" className="nav-link">📝 Register</Link>
          </>
        )}

      </div>
    </nav>
  );
}

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Navbar />

      <div className="main-content">
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/booking" element={<BookingForm />} />
          <Route path="/booking-summary" element={<BookingSummary />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />

          {/* 🔐 Protected Route */}
          <Route
            path="/admin"
            element={token ? <AdminDashboard /> : <Login />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;