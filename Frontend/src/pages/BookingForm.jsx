import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { checkAvailability, getRoomById } from "../services/bookingService";
import { searchCustomerByPhone, createCustomer } from "../services/customerService";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

function BookingForm() {
  // ── Customer (the hotel guest) — NOT the logged-in receptionist ──
  const [phone,            setPhone]            = useState("");
  const [selectedCustomer, setSelectedCustomer]  = useState(null);
  const [searching,        setSearching]         = useState(false);
  const [searchDone,       setSearchDone]        = useState(false);
  const [newCustomer,      setNewCustomer]       = useState({ name: "", email: "", phone: "", address: "" });
  const [customerError,    setCustomerError]     = useState("");

  // ── Companions staying in the same room with the primary guest ──
  const [guests, setGuests] = useState([]);

  const addGuest = () =>
    setGuests([...guests, { name: "", email: "", phone: "", address: "" }]);

  const updateGuest = (idx, field, value) => {
    const updated = [...guests];
    updated[idx] = { ...updated[idx], [field]: value };
    setGuests(updated);
  };

  const removeGuest = (idx) =>
    setGuests(guests.filter((_, i) => i !== idx));

  const [roomId,        setRoomId]        = useState("");
  const [checkIn,       setCheckIn]       = useState(new Date());
  const [checkOut,      setCheckOut]      = useState(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
  const [available,     setAvailable]     = useState(null);
  const [totalAmount,   setTotalAmount]   = useState(0);
  const [nights,        setNights]        = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [pricePerNight, setPricePerNight] = useState(0);

  const role     = (localStorage.getItem("role") || "").toUpperCase();
  const token    = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "";
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { alert("Please login first!"); navigate("/login"); return; }
    if (role !== "ADMIN" && role !== "RECEPTIONIST") {
      alert(`Access Denied: Only Admin and Receptionist can create bookings.\n\n(Your role: "${role || "not set"}")`);
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (checkOut > checkIn) {
      const diff = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      setNights(diff);
      setTotalAmount(diff * pricePerNight);
    } else { setNights(0); setTotalAmount(0); }
  }, [checkIn, checkOut, pricePerNight]);

  useEffect(() => { setAvailable(null); setError(""); }, [roomId, checkIn, checkOut]);

  // ── Step 1: Search guest by phone ──
  const handleSearchCustomer = async () => {
    setCustomerError("");
    setSelectedCustomer(null);
    setSearchDone(false);
    if (!/^[0-9]{10}$/.test(phone)) {
      setCustomerError("Enter a valid 10-digit phone number to search.");
      return;
    }
    setSearching(true);
    try {
      const res = await searchCustomerByPhone(phone);
      const matches = res.data || [];
      if (matches.length > 0) {
        setSelectedCustomer(matches[0]);
      } else {
        // No existing guest — prefill the "add new" form
        setNewCustomer({ name: "", email: "", phone, address: "" });
      }
      setSearchDone(true);
    } catch (err) {
      setCustomerError("Could not search customer. Try again.");
    } finally {
      setSearching(false);
    }
  };

  // ── Step 1b: Register a brand-new guest ──
  const handleAddCustomer = async () => {
    setCustomerError("");
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      setCustomerError("Name, email and phone are required for a new guest.");
      return;
    }
    setSearching(true);
    try {
      const res = await createCustomer(newCustomer);
      setSelectedCustomer(res.data);
    } catch (err) {
      setCustomerError(
        err.response?.data?.message || "Could not add guest. Check the details and try again."
      );
    } finally {
      setSearching(false);
    }
  };

  const changeCustomer = () => {
    setSelectedCustomer(null);
    setSearchDone(false);
    setPhone("");
  };

  const handleCheck = async () => {
    setError("");
    if (!selectedCustomer)     { setError("Please search and select a guest first."); return; }
    if (!roomId.trim())        { setError("Please enter a Room ID."); return; }
    if (isNaN(Number(roomId))) { setError("Room ID must be a number."); return; }
    if (checkOut <= checkIn)   { setError("Check-out must be after check-in."); return; }

    setLoading(true);
    try {
      const res = await checkAvailability(roomId, checkIn, checkOut);
      setAvailable(res.data.available ?? res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
      } else if (err.response?.status === 403) {
        setError("Room is not created. First create then book.");
      } else {
        setError("Could not check availability. Please try again.");
      }
      setAvailable(null);
    } finally { setLoading(false); }
  };

  const handleProceed = () => {
    if (!selectedCustomer) { setError("Please search and select a guest first."); return; }

    // every added guest row needs at least a name before proceeding
    const blankGuest = guests.find((g) => !g.name.trim());
    if (blankGuest) { setError("Please enter a name for every added guest, or remove the empty row."); return; }

    navigate("/booking-summary", {
      state: {
        customerId: selectedCustomer.customerId,
        customerName: selectedCustomer.name,
        roomId, checkIn, checkOut, totalAmount, nights, pricePerNight,
        guests,
      },
    });
  };

  const handleRoomChange = async (val) => {
    setRoomId(val);
    if (!val) { setPricePerNight(0); return; }
    try {
      const res = await getRoomById(val);
      setPricePerNight(res.data.price);
    } catch { setPricePerNight(0); }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <h1>📅 Book a Room</h1>
        <p>Look up the guest, then select dates and check availability</p>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>

        {/* ── LEFT: Booking Form ── */}
        <div className="card">
          <h2>Guest Details</h2>

          {customerError && <div className="alert alert-danger">{customerError}</div>}

          {!selectedCustomer ? (
            <>
              <div className="form-group">
                <label>Guest Phone Number</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary" onClick={handleSearchCustomer} disabled={searching}>
                    {searching ? "⏳" : "🔍 Search"}
                  </button>
                </div>
                <span className="hint">Existing guests are found instantly by phone.</span>
              </div>

              {searchDone && !selectedCustomer && (
                <div style={{ marginTop: "16px", borderTop: "1px dashed #d1d9e6", paddingTop: "16px" }}>
                  <div className="alert alert-danger" style={{ marginBottom: "12px" }}>
                    No guest found with this number — add them below.
                  </div>

                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    />
                  </div>

                  <button className="btn btn-add" onClick={handleAddCustomer} disabled={searching}>
                    ➕ Add Guest & Continue
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{
              background: "#f0fff4",
              border: "1.5px solid #b8f0c0",
              borderRadius: "8px",
              padding: "14px 16px",
              marginBottom: "8px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "#166534" }}>{selectedCustomer.name}</strong>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    📞 {selectedCustomer.phone} &nbsp;•&nbsp; ✉️ {selectedCustomer.email}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9aa3b2" }}>Guest ID: #{selectedCustomer.customerId}</div>
                </div>
                <button className="btn btn-clear" onClick={changeCustomer}>↺ Change</button>
              </div>
            </div>
          )}

          {/* ── Booking Details — only after a guest is picked ── */}
          {selectedCustomer && (
            <>
              <h2 style={{ marginTop: "24px" }}>Booking Details</h2>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="form-group">
                <label>Room ID</label>
                <input
                  type="number"
                  placeholder="Enter Room ID (e.g. 1, 2, 3)"
                  value={roomId}
                  onChange={(e) => handleRoomChange(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Check-In Date</label>
                  <DatePicker
                    selected={checkIn}
                    onChange={(date) => setCheckIn(date)}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="date-input"
                  />
                </div>
                <div className="form-group">
                  <label>Check-Out Date</label>
                  <DatePicker
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    minDate={new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)}
                    dateFormat="dd/MM/yyyy"
                    className="date-input"
                  />
                </div>
              </div>

              {/* ── Companions — how many people are coming to the room ── */}
              <div style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ margin: 0 }}>
                    सोबत येणारे guests
                    <span style={{ marginLeft: "8px", fontSize: "12px", color: "#9aa3b2" }}>
                      ({guests.length} added — optional)
                    </span>
                  </label>
                  <button type="button" className="btn btn-add" onClick={addGuest} style={{ padding: "6px 12px", fontSize: "13px" }}>
                    ➕ Add Guest
                  </button>
                </div>

                {guests.map((g, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e8edf3",
                      borderRadius: "8px",
                      padding: "14px",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <strong style={{ fontSize: "13px", color: "#6b7a99" }}>Guest {idx + 2}</strong>
                      <button
                        type="button"
                        className="btn btn-clear"
                        onClick={() => removeGuest(idx)}
                        style={{ padding: "3px 10px", fontSize: "12px" }}
                      >
                        ✖ Remove
                      </button>
                    </div>

                    <div className="form-grid">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Name *</label>
                        <input
                          value={g.name}
                          onChange={(e) => updateGuest(idx, "name", e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Phone</label>
                        <input
                          value={g.phone}
                          onChange={(e) => updateGuest(idx, "phone", e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Email</label>
                        <input
                          value={g.email}
                          onChange={(e) => updateGuest(idx, "email", e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Address</label>
                        <input
                          value={g.address}
                          onChange={(e) => updateGuest(idx, "address", e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary"
                onClick={handleCheck}
                disabled={loading}
                style={{ width: "100%", justifyContent: "center", fontSize: "15px", padding: "13px" }}
              >
                {loading ? "⏳ Checking..." : "🔍 Check Availability"}
              </button>

              {available !== null && (
                <div
                  className={`alert ${available ? "alert-success" : "alert-danger"}`}
                  style={{ marginTop: "14px" }}
                >
                  {available ? "✅ Room is Available!" : "❌ Room is Not Available for selected dates"}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT: Price Summary ── */}
        <div className="card">
          <h2>Price Summary</h2>

          {/* Staff Info Badge */}
          <div style={{
            background: "#f0f4fa",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "#374151",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}>
            <span>👤 Booked by <strong>{username}</strong></span>
            <span style={{ color: "#d1d9e6" }}>|</span>
            <span>Role: <strong style={{ color: "#cc0000" }}>{role}</strong></span>
            {selectedCustomer && (
              <>
                <span style={{ color: "#d1d9e6" }}>|</span>
                <span>Guest: <strong style={{ color: "#008009" }}>{selectedCustomer.name}</strong></span>
                <span style={{ color: "#d1d9e6" }}>|</span>
                <span>Total occupants: <strong style={{ color: "#008009" }}>{guests.length + 1}</strong></span>
              </>
            )}
          </div>

          <div>
            <div className="invoice-row">
              <span style={{ color: "#6b7a99" }}>Price per Night</span>
              <strong>₹{pricePerNight.toLocaleString("en-IN")}</strong>
            </div>
            <div className="invoice-row">
              <span style={{ color: "#6b7a99" }}>Number of Nights</span>
              <strong>{nights}</strong>
            </div>
            <div className="invoice-row" style={{ marginTop: "8px", paddingTop: "12px", borderTop: "2px solid #e8edf3" }}>
              <span style={{ color: "#1a1a2e", fontWeight: 700, fontSize: "16px" }}>Total Amount</span>
              <strong style={{ color: "#008009", fontSize: "22px" }}>
                ₹{totalAmount.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {available === true && (
            <button
              className="btn btn-success"
              onClick={handleProceed}
              style={{ width: "100%", justifyContent: "center", fontSize: "15px", padding: "13px", marginTop: "20px" }}
            >
              Proceed to Confirm →
            </button>
          )}

          {available === false && (
            <div className="alert alert-danger" style={{ marginTop: "16px", textAlign: "center" }}>
              Please select different dates or a different room.
            </div>
          )}

          {!selectedCustomer && (
            <div style={{
              background: "#f8fafc",
              border: "1px dashed #d1d9e6",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              color: "#9aa3b2",
              fontSize: "14px",
              marginTop: "20px",
            }}>
              Search or add a guest first
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingForm;