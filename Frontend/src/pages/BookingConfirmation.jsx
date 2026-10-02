import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state;

  if (!booking) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p>
          No booking found. <a href="/">Go to Home</a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>🎉 Booking Confirmed!</h1>
        <p>Your room has been successfully reserved</p>
      </div>

      <div style={{ maxWidth: "520px", margin: "0 auto" }}>

        {/* ──── Success Banner ──── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e, #2d2d50)",
            borderRadius: "14px",
            padding: "32px",
            textAlign: "center",
            color: "#fff",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>✅</div>
          <h2 style={{ color: "#e2b96f", fontSize: "22px", marginBottom: "8px" }}>
            Booking Successful!
          </h2>
          <p style={{ color: "#ccc", fontSize: "14px" }}>
            The reservation has been confirmed. We look forward to welcoming the guest.
          </p>
        </div>

        {/* ──── Invoice ──── */}
        <div className="invoice-box">
          <h3>🧾 Invoice</h3>

          {booking.id && (
            <div className="invoice-row">
              <span>Booking ID</span>
              <span style={{ fontWeight: "700", color: "#e2b96f" }}>
                #{booking.id}
              </span>
            </div>
          )}

          {booking.customerId && (
            <div className="invoice-row">
              <span>Customer ID</span>
              <span>#{booking.customerId}</span>
            </div>
          )}

          {booking.roomId && (
            <div className="invoice-row">
              <span>Room</span>
              <span>#{booking.roomId}</span>
            </div>
          )}

          {booking.guestName && (
            <div className="invoice-row">
              <span>Guest</span>
              <span>{booking.guestName}</span>
            </div>
          )}

          {booking.guestEmail && (
            <div className="invoice-row">
              <span>Email</span>
              <span>{booking.guestEmail}</span>
            </div>
          )}

          {(booking.checkIn || booking.checkInDate) && (
            <div className="invoice-row">
              <span>Check-In</span>
              <span>
                {new Date(booking.checkIn || booking.checkInDate).toDateString()}
              </span>
            </div>
          )}

          {(booking.checkOut || booking.checkOutDate) && (
            <div className="invoice-row">
              <span>Check-Out</span>
              <span>
                {new Date(booking.checkOut || booking.checkOutDate).toDateString()}
              </span>
            </div>
          )}

          {booking.nights && (
            <div className="invoice-row">
              <span>Nights</span>
              <span>{booking.nights}</span>
            </div>
          )}

          {booking.totalAmount !== undefined && (
            <div className="invoice-row">
              <span>Total Amount</span>
              <span style={{ color: "#27ae60", fontSize: "18px", fontWeight: "bold" }}>
                ₹{Number(booking.totalAmount).toLocaleString()}
              </span>
            </div>
          )}

          {booking.status && (
            <div className="invoice-row">
              <span>Status</span>
              <span
                style={{
                  color: booking.status === "CONFIRMED" ? "#27ae60" : "#e67e22",
                  fontWeight: "600",
                }}
              >
                {booking.status}
              </span>
            </div>
          )}
        </div>

        {/* ──── Actions ──── */}
        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/")}
            style={{ flex: 1 }}
          >
            🏠 Back to Home
          </button>
          <button
            className="btn btn-gold"
            onClick={() => navigate("/booking")}
            style={{ flex: 1 }}
          >
            📅 New Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
