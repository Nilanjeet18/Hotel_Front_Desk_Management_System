import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCustomers } from "../services/customerService";
import { getAllBookings, updateBooking, cancelBooking, checkoutBooking, getBookingById } from "../services/bookingService";

function ReceptionBookings() {
  const [bookings, setBookings]   = useState([]);
  const [customers, setCustomers] = useState({}); // id -> customer
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData]   = useState({ checkIn: "", checkOut: "" });
  const [actionLoading, setActionLoading] = useState(null);

  // ── Companion guests modal — shows everyone staying in the room ──
  const [guestModalBooking, setGuestModalBooking] = useState(null); // full Booking object
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

  // ✅ Day-wise filter — defaults to today, toggle off to see everything
  const todayStr = new Date().toISOString().split("T")[0];
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [dateFilterOn, setDateFilterOn] = useState(true);

  // ✅ Checkout + Invoice flow state, keyed by bookingId
  //    { invoice, email, sending, error, sent }
  const [checkoutState, setCheckoutState] = useState({});

  const role  = (localStorage.getItem("role") || "").toUpperCase();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { alert("Please login first!"); navigate("/login"); return; }
    if (role !== "RECEPTIONIST") {
      alert("Access Denied: Only Receptionist can access this page.");
      navigate("/");
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingsRes, customersRes] = await Promise.all([
        getAllBookings(),
        getAllCustomers(),
      ]);

      setBookings(bookingsRes.data || []);

      const map = {};
      (customersRes.data || []).forEach((c) => { map[c.customerId] = c; });
      setCustomers(map);
    } catch (err) {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (booking) => {
    setEditingId(booking.bookingId);
    setEditData({
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
    });
  };

  const handleUpdate = async (bookingId) => {
    if (!editData.checkIn || !editData.checkOut) {
      alert("Please enter both check-in and check-out dates.");
      return;
    }
    if (new Date(editData.checkOut) <= new Date(editData.checkIn)) {
      alert("Check-out must be after check-in.");
      return;
    }
    setActionLoading(bookingId);
    try {
      await updateBooking(bookingId, editData);
      alert("✅ Booking updated successfully!");
      setEditingId(null);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed. Try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    setActionLoading(bookingId);
    try {
      await cancelBooking(bookingId);
      alert("✅ Booking cancelled!");
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed. Try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── STEP 1: Check-out → auto-generates the invoice on the backend ──
  const handleCheckout = async (booking) => {
    if (!window.confirm(`Check out guest for Booking #${booking.bookingId}?`)) return;
    setActionLoading(booking.bookingId);
    try {
      const res = await checkoutBooking(booking.bookingId);
      const invoice = res.data;
      const guest = customers[booking.customerId];

      // Update the booking's status locally so the row switches to invoice mode
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === booking.bookingId ? { ...b, status: "CHECKED_OUT" } : b))
      );
      setCheckoutState((prev) => ({
        ...prev,
        [booking.bookingId]: {
          invoice,
          email: guest?.email || "",
          sending: false,
          error: "",
          sent: invoice.emailSent || false,
        },
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Checkout failed. Try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── STEP 2: Verify/edit email, then Send Invoice ──
  const setCheckoutEmail = (bookingId, email) => {
    setCheckoutState((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], email, error: "" },
    }));
  };

  const handleSendInvoice = async (bookingId) => {
    const state = checkoutState[bookingId];
    if (!state?.invoice) return;

    const email = (state.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCheckoutState((prev) => ({
        ...prev,
        [bookingId]: { ...prev[bookingId], error: "Enter a valid email before sending." },
      }));
      return;
    }

    setCheckoutState((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], sending: true, error: "" },
    }));

    try {
      const res = await sendInvoice(state.invoice.id, email);
      setCheckoutState((prev) => ({
        ...prev,
        [bookingId]: { ...prev[bookingId], invoice: res.data, sending: false, sent: true },
      }));
    } catch (err) {
      setCheckoutState((prev) => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          sending: false,
          error: err.response?.data?.message || "Could not send invoice. Try again.",
        },
      }));
    }
  };

  // ── Client-side filter: booking ID, room ID, guest name or phone ──
  //    combined with the day-wise date filter (both must match) ──
  const q = search.trim().toLowerCase();
  const filteredBookings = bookings.filter((b) => {
    const guest = customers[b.customerId];

    const matchesText =
      !q ||
      String(b.bookingId).includes(q) ||
      String(b.roomId).includes(q) ||
      (guest?.name || "").toLowerCase().includes(q) ||
      (guest?.phone || "").includes(q);

    const matchesDate =
      !dateFilterOn || !dateFilter ||
      (b.checkInDate <= dateFilter && dateFilter < b.checkOutDate);

    return matchesText && matchesDate;
  });

  if (loading) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px" }}>
        <p>⏳ Loading bookings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>🛎️ Manage Guest Bookings</h1>
        <p>All bookings — update, cancel, or check out and send the invoice</p>
      </div>

      {/* ── Optional search — narrows the list, not required ── */}
      <div className="search-card" style={{ marginBottom: "16px" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label>🔍 Search (optional) — guest name, phone, booking ID or room ID</label>
          <input
            placeholder="Start typing to filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ✅ Day-wise filter — pick any date to see who's in-house that day */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
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

      {error && <div className="alert alert-danger" style={{ marginBottom: "16px" }}>⚠️ {error}</div>}

      <div className="rooms-card">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            {bookings.length === 0 ? "No bookings yet." : "No bookings match your search/date."}
          </div>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Guests</th>
                <th>Room ID</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const guest = customers[b.customerId];
                const co = checkoutState[b.bookingId];

                return (
                  <React.Fragment key={b.bookingId}>
                    <tr>
                      <td>#{b.bookingId}</td>
                      <td>
                        {guest ? (
                          <>
                            <strong style={{ color: "#003580" }}>{guest.name}</strong>
                            <div style={{ fontSize: "12px", color: "#9aa3b2" }}>{guest.phone}</div>
                          </>
                        ) : (
                          <span style={{ color: "#9aa3b2" }}>Guest #{b.customerId}</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "4px 10px", fontSize: "12px" }}
                          onClick={() => viewGuests(b.bookingId)}
                        >
                          👥 {b.guestCount + 1}
                        </button>
                      </td>
                      <td>#{b.roomId}</td>

                      {editingId === b.bookingId ? (
                        <>
                          <td>
                            <input
                              type="date"
                              value={editData.checkIn}
                              onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              value={editData.checkOut}
                              onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })}
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString("en-IN") : "—"}</td>
                          <td>{b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString("en-IN") : "—"}</td>
                        </>
                      )}

                      <td>₹{Number(b.amount ?? 0).toLocaleString("en-IN")}</td>
                      <td>{b.status}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {b.status === "CONFIRMED" && (
                          editingId === b.bookingId ? (
                            <>
                              <button
                                className="btn btn-success"
                                style={{ padding: "5px 10px", fontSize: "12px", marginRight: "6px" }}
                                disabled={actionLoading === b.bookingId}
                                onClick={() => handleUpdate(b.bookingId)}
                              >
                                💾 Save
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ padding: "5px 10px", fontSize: "12px" }}
                                onClick={() => setEditingId(null)}
                              >
                                ✕ Close
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-primary"
                                style={{ padding: "5px 10px", fontSize: "12px", marginRight: "6px" }}
                                onClick={() => startEdit(b)}
                              >
                                ✏️ Update
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ padding: "5px 10px", fontSize: "12px", marginRight: "6px" }}
                                disabled={actionLoading === b.bookingId}
                                onClick={() => handleCancel(b.bookingId)}
                              >
                                ❌ Cancel
                              </button>
                              <button
                                className="btn btn-success"
                                style={{ padding: "5px 10px", fontSize: "12px" }}
                                disabled={actionLoading === b.bookingId}
                                onClick={() => handleCheckout(b)}
                              >
                                🛎️ Check-Out
                              </button>
                            </>
                          )
                        )}
                        {b.status === "CHECKED_OUT" && !co && (
                          <span style={{ color: "#9aa3b2", fontSize: "12px" }}>Checked out ✅</span>
                        )}
                      </td>
                    </tr>

                    {/* ── Invoice panel — appears right after checkout ── */}
                    {co && (
                      <tr>
                        <td colSpan="8" style={{ padding: 0, background: "#0f1420" }}>
                          <div style={{ padding: "16px 20px" }}>
                            <div style={{
                              display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
                            }}>
                              <div>
                                <strong style={{ color: "#febb02" }}>🧾 Invoice #{co.invoice.id}</strong>
                                <div style={{ fontSize: "13px", color: "#9aa3b2", marginTop: "4px" }}>
                                  Room ₹{co.invoice.roomCharges} + GST ₹{co.invoice.tax.toFixed(2)}
                                  {" = "}
                                  <strong style={{ color: "#008009" }}>
                                    ₹{co.invoice.finalAmount.toLocaleString("en-IN")}
                                  </strong>
                                </div>
                              </div>
                              <button
                                className="btn btn-primary"
                                style={{ padding: "6px 12px", fontSize: "12px", height: "fit-content" }}
                                onClick={() => downloadInvoicePdf(co.invoice.id)}
                              >
                                ⬇️ Download PDF
                              </button>
                            </div>

                            {co.error && <div className="alert alert-danger" style={{ marginTop: "10px" }}>{co.error}</div>}

                            {co.sent ? (
                              <div className="alert alert-success" style={{ marginTop: "12px" }}>
                                ✅ Invoice sent to <strong>{co.invoice.guestEmail}</strong>
                                {co.invoice.sentAt && (
                                  <> on {new Date(co.invoice.sentAt).toLocaleString("en-IN")}</>
                                )}
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
                                <label style={{ fontSize: "13px", color: "#9aa3b2" }}>Verify guest email:</label>
                                <input
                                  type="email"
                                  value={co.email}
                                  onChange={(e) => setCheckoutEmail(b.bookingId, e.target.value)}
                                  placeholder="guest@example.com"
                                  style={{ maxWidth: "260px" }}
                                />
                                <button
                                  className="btn btn-success"
                                  style={{ padding: "8px 16px", fontSize: "13px" }}
                                  disabled={co.sending}
                                  onClick={() => handleSendInvoice(b.bookingId)}
                                >
                                  {co.sending ? "⏳ Sending..." : "📧 Send Invoice"}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="table-footer">
          Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
        </div>
      </div>

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
            style={{ maxWidth: "480px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {guestModalLoading ? (
              <p style={{ textAlign: "center", padding: "24px" }}>⏳ Loading...</p>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ margin: 0 }}>👥 Room occupants — Booking #{guestModalBooking.bookingId}</h2>
                  <button className="btn btn-clear" onClick={() => setGuestModalBooking(null)}>✖</button>
                </div>

                {/* Primary (paying) guest */}
                <div style={{ background: "#f0fff4", border: "1.5px solid #b8f0c0", borderRadius: "8px", padding: "12px 14px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>PRIMARY GUEST</span>
                  <div style={{ fontWeight: 600, color: "#003580" }}>{guestModalBooking.customer?.name || "—"}</div>
                  <div style={{ fontSize: "13px", color: "#6b7a99" }}>
                    📞 {guestModalBooking.customer?.phone || "—"} &nbsp;•&nbsp; ✉️ {guestModalBooking.customer?.email || "—"}
                  </div>
                </div>

                {/* Companions */}
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

export default ReceptionBookings;