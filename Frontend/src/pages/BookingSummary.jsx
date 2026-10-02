import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../services/bookingService";

function BookingSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  // .toUpperCase() - handles "admin" / "ADMIN" / "Admin" all cases
  const role  = (localStorage.getItem("role") || "").toUpperCase();

  // guests: companions added on the booking form (name/email/phone/address)
  const { roomId, checkIn, checkOut, totalAmount, nights, customerId, pricePerNight, customerName, guests } =
    location.state || {};

  const companions = guests || [];

  // Only ADMIN and RECEPTIONIST can confirm bookings
  const canConfirm = token && (role === "ADMIN" || role === "RECEPTIONIST");

  const handleConfirm = async () => {
    setError("");

    if (!token) {
      alert("⚠️ Please login first!");
      navigate("/login");
      return;
    }

    if (role !== "ADMIN" && role !== "RECEPTIONIST") {
      setError("Access Denied: Only Admin and Receptionist can create bookings.");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        customerId,
        roomId,
        checkIn,
        checkOut,
        // FIX: this was missing entirely before, so companions never
        // reached the backend even though they were collected on the form.
        guests: companions,
      };

      const res = await createBooking(bookingData);

      navigate("/booking-confirmation", {
        state: {
          ...res.data,
          totalAmount,
          nights,
        },
      });

    } catch (err) {
      console.error("Booking error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
      } else if (err.response?.status === 403) {
        setError("Access denied. Your account doesn't have permission to create bookings.");
      } else if (err.response?.status === 409) {
        setError("Room is no longer available for the selected dates. Please go back and choose different dates.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!roomId) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p>
          No booking data found. Please{" "}
          <a href="/booking">go back and fill the form</a>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>📋 Booking Summary</h1>
        <p>Please review your booking before confirming</p>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>

        {/* LEFT: Invoice Details */}
        <div className="invoice-box">
          <h3>Booking Details</h3>

          <div className="invoice-row">
            <span>Guest</span>
            <span>{customerName ? `${customerName} (#${customerId})` : `#${customerId}`}</span>
          </div>
          <div className="invoice-row">
            <span>Room ID</span>
            <span>#{roomId}</span>
          </div>
          <div className="invoice-row">
            <span>Check-In</span>
            <span>{checkIn ? new Date(checkIn).toDateString() : "—"}</span>
          </div>
          <div className="invoice-row">
            <span>Check-Out</span>
            <span>{checkOut ? new Date(checkOut).toDateString() : "—"}</span>
          </div>
          <div className="invoice-row">
            <span>Price per Night</span>
            <span>₹{pricePerNight}</span>
          </div>
          <div className="invoice-row">
            <span>Number of Nights</span>
            <span>{nights}</span>
          </div>
          <div className="invoice-row">
            <span>Total occupants</span>
            <span>{companions.length + 1}</span>
          </div>

          {/* Companions list - shown only when present */}
          {companions.length > 0 && (
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e8edf3" }}>
              <div style={{ fontSize: "13px", color: "#6b7a99", marginBottom: "8px", fontWeight: 600 }}>
                सोबत येणारे guests ({companions.length})
              </div>
              {companions.map((g, i) => (
                <div key={i} style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>
                  {i + 1}. {g.name}{g.phone ? ` — ${g.phone}` : ""}
                </div>
              ))}
            </div>
          )}

          <div className="invoice-row">
            <span>Total Amount</span>
            <span style={{ color: "green", fontWeight: "bold" }}>
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* RIGHT: Confirm Panel */}
        <div className="card">
          <h2>Ready to Confirm?</h2>

          {role && (
            <div
              style={{
                background: "#f0f4ff",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "14px",
                fontSize: "13px",
                color: "#444",
              }}
            >
              Logged in as: <strong>{role}</strong>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: "14px" }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className="btn btn-success"
            onClick={handleConfirm}
            disabled={loading || !canConfirm}
            style={{
              width: "100%",
              marginBottom: "12px",
              backgroundColor: canConfirm ? "#27ae60" : "#aaa",
              cursor: canConfirm ? "pointer" : "not-allowed",
              opacity: canConfirm ? 1 : 0.7,
            }}
          >
            {loading
              ? "⏳ Confirming..."
              : !token
              ? "🔒 Login Required"
              : !canConfirm
              ? "🚫 No Permission"
              : "✅ Confirm Booking"}
          </button>

          {role === "MANAGER" && (
            <div className="alert alert-danger" style={{ fontSize: "13px" }}>
              Managers cannot create bookings. Only viewing, updating, and cancelling is allowed.
            </div>
          )}

          <button
            className="btn btn-danger"
            onClick={() => navigate("/booking")}
            style={{ width: "100%" }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingSummary;