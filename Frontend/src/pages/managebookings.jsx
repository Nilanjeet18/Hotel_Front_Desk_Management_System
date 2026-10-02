import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllBookings,
  updateBooking,
  cancelBooking,
  getBookingById,
} from "../services/bookingService";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Companion guests modal — shows everyone staying in the room ──
  const [guestModalBooking, setGuestModalBooking] = useState(null);
  const [guestModalLoading, setGuestModalLoading] = useState(false);

  const viewGuests = async (bookingId) => {
    setGuestModalLoading(true);
    try {
      const res = await getBookingById(bookingId);
      setGuestModalBooking(res.data);
    } catch (err) {
      alert("Could not load guest details.");
    } finally {
      setGuestModalLoading(false);
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    checkInDate: "",
    checkOutDate: "",
  });
  const [actionLoading, setActionLoading] = useState(null);

  // ✅ Day-wise filter — defaults to today, toggle off to see everything
  const todayStr = new Date().toISOString().split("T")[0];
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [dateFilterOn, setDateFilterOn] = useState(true);

  const role = (localStorage.getItem("role") || "").toUpperCase();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("Please login first!");
      navigate("/login");
      return;
    }
    if (role !== "ADMIN" && role !== "MANAGER") {
      alert("Access Denied: Only Admin and Manager can manage bookings.");
      navigate("/");
      return;
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllBookings();
      // Backend BookingResponseDTO returns: checkIn, checkOut, totalAmount
      console.log("✅ API Response:", res.data);
      setBookings(res.data);
    } catch (err) {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (bookingId) => {
    if (!editData.checkInDate || !editData.checkOutDate) {
      alert("Please enter both check-in and check-out dates.");
      return;
    }
    if (new Date(editData.checkOutDate) <= new Date(editData.checkInDate)) {
      alert("Check-out must be after check-in.");
      return;
    }
    setActionLoading(bookingId);
    try {
      // BookingDTO expects: checkInDate, checkOutDate
      await updateBooking(bookingId, {
        checkInDate: editData.checkInDate,
        checkOutDate: editData.checkOutDate,
      });
      alert("✅ Booking updated successfully!");
      setEditingId(null);
      fetchBookings();
    } catch (err) {
      alert(
        err.response?.status === 403
          ? "Access denied."
          : "Update failed: " + (err.response?.data?.message || "Try again."),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    if (!token) {
      alert("❌ No Token! Please login again.");
      return;
    }
    if (role !== "ADMIN" && role !== "MANAGER") {
      alert("❌ Access denied.");
      return;
    }

    setActionLoading(bookingId);
    try {
      await cancelBooking(bookingId);
      alert("✅ Booking cancelled!");
      fetchBookings();
    } catch (err) {
      console.error("Cancel Error:", err);
      if (err.response?.status === 403) {
        alert("❌ Access denied: May be Token was expired, pls login again.");
      } else if (err.response?.status === 404) {
        alert("❌ Booking is not found.");
      } else {
        alert(
          "❌ Cancel failed: " + (err.response?.data?.message || "Try again."),
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (booking) => {
    setEditingId(booking.bookingId);
    setEditData({
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
    });
  };

  // ✅ FIX: backend BookingResponseDTO sends `totalAmount`, not `amount`.
  //    Keep `amount` as a fallback in case another endpoint shape is used.
  const getAmount = (booking) => booking.totalAmount ?? booking.amount ?? null;

  // ✅ Day-wise filter — guest is "in house" on dateFilter if
  //    checkIn <= dateFilter < checkOut (string compare works since
  //    dates come as "YYYY-MM-DD").
  const visibleBookings = bookings.filter((b) => {
    if (!dateFilterOn || !dateFilter) return true;
    return b.checkInDate <= dateFilter && dateFilter < b.checkOutDate;
  });

  if (loading)
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px" }}>
        <p>⏳ Loading bookings...</p>
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <h1>📋 Manage Bookings</h1>
        <p>
          {role === "ADMIN"
            ? "Admin: View, Update, and Cancel all bookings"
            : "Manager: View, Update, and Cancel bookings"}
        </p>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <span
          style={{
            background: role === "ADMIN" ? "#e74c3c" : "#2980b9",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {role}
        </span>
        <button
          className="btn btn-primary"
          onClick={fetchBookings}
          style={{ marginLeft: "12px", padding: "6px 14px", fontSize: "13px" }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ✅ Day-wise filter — pick any date to see who's in-house that day */}
      <div className="search-card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>📅 View bookings for date</label>
            <input
              type="date"
              value={dateFilter}
              disabled={!dateFilterOn}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setDateFilter(todayStr); setDateFilterOn(true); }}
            style={{ padding: "9px 16px", fontSize: "13px" }}
          >
            Today
          </button>
          <button
            className={dateFilterOn ? "btn btn-clear" : "btn btn-primary"}
            onClick={() => setDateFilterOn(!dateFilterOn)}
            style={{ padding: "9px 16px", fontSize: "13px" }}
          >
            {dateFilterOn ? "✖ Clear filter (show all)" : "📅 Filter by date"}
          </button>
        </div>
        {dateFilterOn && (
          <p style={{ fontSize: "13px", color: "#9aa3b2", marginTop: "10px", marginBottom: 0 }}>
            Showing guests whose stay covers {new Date(dateFilter).toLocaleDateString("en-IN")}
          </p>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

      {visibleBookings.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#777" }}>
            {bookings.length === 0
              ? "No bookings found."
              : "No guests in-house for the selected date."}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <thead>
              <tr style={{ background: "#1a1a2e", color: "#e2b96f" }}>
                <th style={th}>Booking ID</th>
                <th style={th}>Customer ID</th>
                <th style={th}>Guests</th>
                <th style={th}>Room ID</th>
                <th style={th}>Check-In</th>
                <th style={th}>Check-Out</th>
                <th style={th}>Amount</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((booking, idx) => {
                console.log("🔥 Booking Row:", booking);
                const amount = getAmount(booking);
                return (
                  <tr
                    key={booking.bookingId}
                    style={{
                      background: idx % 2 === 0 ? "#fafafa" : "#fff",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <td style={td}>#{booking.bookingId ?? "—"}</td>

                    <td style={td}>
                      {booking.customer?.customerId ??
                        booking.customerId ??
                        "—"}
                    </td>

                    <td style={td}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() => viewGuests(booking.bookingId)}
                      >
                        👥 {(booking.guestCount ?? 0) + 1}
                      </button>
                    </td>

                    <td style={td}>
                      #{booking.room?.roomId ?? booking.roomId ?? "—"}
                    </td>

                    {editingId === booking.bookingId ? (
                      <>
                        <td style={td}>
                          <input
                            type="date"
                            value={editData.checkInDate}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                checkInDate: e.target.value,
                              })
                            }
                            style={inputStyle}
                          />
                        </td>
                        <td style={td}>
                          <input
                            type="date"
                            value={editData.checkOutDate}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                checkOutDate: e.target.value,
                              })
                            }
                            style={inputStyle}
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Check-In */}
                        <td style={td}>
                          {booking.checkInDate
                            ? new Date(booking.checkInDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "—"}
                        </td>

                        {/* Check-Out */}
                        <td style={td}>
                          {booking.checkOutDate
                            ? new Date(booking.checkOutDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "—"}
                        </td>
                      </>
                    )}

                    {/* Amount — ✅ fixed field name */}
                    <td style={td}>
                      {amount != null
                        ? `₹${Number(amount).toLocaleString("en-IN")}`
                        : "—"}
                    </td>

                    <td style={td}>{booking.status || "PENDING"}</td>

                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      {booking.status !== "CANCELLED" && (
                        <>
                          {editingId === booking.bookingId ? (
                            <>
                              <button
                                className="btn btn-success"
                                style={actionBtn}
                                disabled={actionLoading === booking.bookingId}
                                onClick={() => handleUpdate(booking.bookingId)}
                              >
                                💾 Save
                              </button>
                              <button
                                className="btn btn-danger"
                                style={actionBtn}
                                onClick={() => setEditingId(null)}
                              >
                                ✕ Close
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-primary"
                                style={actionBtn}
                                onClick={() => startEdit(booking)}
                              >
                                ✏️ Update
                              </button>
                              <button
                                className="btn btn-danger"
                                style={actionBtn}
                                disabled={actionLoading === booking.bookingId}
                                onClick={() => handleCancel(booking.bookingId)}
                              >
                                ❌ Cancel
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="table-footer">
            Showing <strong>{visibleBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
          </div>
        </div>
      )}

      {/* ── Guests modal — primary guest + companions for one booking ── */}
      {(guestModalLoading || guestModalBooking) && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setGuestModalBooking(null)}
        >
          <div
            className="card"
            style={{ maxWidth: "480px", width: "90%", maxHeight: "80vh", overflowY: "auto", background: "#fff", borderRadius: "12px", padding: "20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {guestModalLoading ? (
              <p style={{ textAlign: "center", padding: "24px" }}>⏳ Loading...</p>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ margin: 0 }}>👥 Room occupants — Booking #{guestModalBooking.bookingId}</h2>
                  <button className="btn btn-danger" style={actionBtn} onClick={() => setGuestModalBooking(null)}>✖</button>
                </div>

                <div style={{ background: "#f0fff4", border: "1.5px solid #b8f0c0", borderRadius: "8px", padding: "12px 14px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>PRIMARY GUEST</span>
                  <div style={{ fontWeight: 600, color: "#003580" }}>{guestModalBooking.customer?.name || "—"}</div>
                  <div style={{ fontSize: "13px", color: "#6b7a99" }}>
                    📞 {guestModalBooking.customer?.phone || "—"} &nbsp;•&nbsp; ✉️ {guestModalBooking.customer?.email || "—"}
                  </div>
                </div>

                {(guestModalBooking.guests || []).length === 0 ? (
                  <p style={{ color: "#9aa3b2", fontSize: "13px" }}>No additional companions were added for this booking.</p>
                ) : (
                  guestModalBooking.guests.map((g, i) => (
                    <div key={i} style={{ background: "#f8fafc", border: "1px solid #e8edf3", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", color: "#6b7a99", fontWeight: 600 }}>COMPANION {i + 1}</span>
                      <div style={{ fontWeight: 600 }}>{g.name}</div>
                      <div style={{ fontSize: "13px", color: "#6b7a99" }}>
                        {g.phone && <>📞 {g.phone}&nbsp;•&nbsp;</>}
                        {g.email && <>✉️ {g.email}&nbsp;</>}
                        {!g.phone && !g.email && "No contact details provided"}
                      </div>
                      {g.address && <div style={{ fontSize: "12px", color: "#9aa3b2" }}>{g.address}</div>}
                    </div>
                  ))
                )}

                <div style={{ marginTop: "10px", fontSize: "13px", color: "#374151" }}>
                  Total occupants: <strong>{(guestModalBooking.guests || []).length + 1}</strong>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const th = {
  padding: "14px 16px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "13px",
  letterSpacing: "0.5px",
};
const td = { padding: "12px 16px", fontSize: "14px", color: "#333" };
const actionBtn = {
  padding: "5px 10px",
  fontSize: "12px",
  marginRight: "6px",
  borderRadius: "6px",
};
const inputStyle = {
  padding: "5px 8px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "13px",
  width: "130px",
};

export default ManageBookings;