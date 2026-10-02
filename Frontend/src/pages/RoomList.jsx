import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoomForm from "../components/RoomForm";
import { getAllRooms } from "../services/roomService";

/* ── Java Room model: roomId | roomNumber | roomType | price | status ── */
const ROOM_TYPES = ["All", "Single", "Double", "Suite", "Deluxe", "Family"];

const statusClass = (status) => {
  if (!status) return "status-unknown";
  switch (status.toLowerCase()) {
    case "available":   return "status-available";
    case "booked":      return "status-booked";
    case "maintenance": return "status-maintenance";
    default:            return "status-unknown";
  }
};

const typeEmoji = (type) => {
  const map = { single: "🛏", double: "🛏🛏", suite: "👑", deluxe: "✨", family: "👨‍👩‍👧" };
  return map[(type || "").toLowerCase()] || "🚪";
};

const RoomList = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // ✅ Only ADMIN can add/edit/delete rooms.
  //    Receptionist can only VIEW available rooms (per requirements).
  const role = (localStorage.getItem("role") || "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const isReceptionist = role === "RECEPTIONIST";

  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [search,       setSearch]       = useState("");
  const [filterType,   setFilterType]   = useState("All");

  const fetchRooms = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const data = await getAllRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      setFetchError("Unable to load rooms. Please check the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleRowClick = (room) => {
    if (!isAdmin) return; // only admin can select a row to edit
    setSelectedRoom(room);
    document.getElementById("manage-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredRooms = rooms.filter((r) => {
    const matchSearch =
      search === "" ||
      String(r.roomNumber ?? "").includes(search) ||
      (r.roomType ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || r.roomType === filterType;
    // ✅ Receptionist only ever sees Available rooms
    const matchAvailability =
      !isReceptionist || (r.status ?? "").toLowerCase() === "available";
    return matchSearch && matchType && matchAvailability;
  });

  return (
    <div className="room-list-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <h1>🚪 Room Management</h1>
        <p>
          {isAdmin
            ? "Add, update, delete and view all hotel rooms"
            : isReceptionist
            ? "Available rooms right now"
            : "Browse available hotel rooms"}
        </p>
      </div>

      {/* ── Guest Banner ── */}
      {!isLoggedIn && (
        <div className="login-banner">
          <span>🔒 You're browsing as a <strong>guest</strong>. Log in to add, update or delete rooms.</span>
          <button className="btn-login-now" onClick={() => navigate("/login")}>
            Login to Manage
          </button>
        </div>
      )}

      {/* ── Manage Form — ADMIN ONLY ── */}
      {isAdmin && (
        <div id="manage-form">
          <RoomForm
            selectedRoom={selectedRoom}
            onSuccess={fetchRooms}
            onClear={() => setSelectedRoom(null)}
          />
        </div>
      )}

      {/* ── Search & Filter ── */}
      <div className="search-card">
        <div className="form-grid">
          <div className="form-group" style={{ margin: 0 }}>
            <label>🔍 Search Rooms</label>
            <input
              placeholder="Room number or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Filter by Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Rooms Table ── */}
      <div className="rooms-card">
        {loading ? (
          <div className="empty-state">
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
            Loading rooms...
          </div>
        ) : fetchError ? (
          <div className="empty-state error">
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⚠️</div>
            {fetchError}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
            {isReceptionist ? "No available rooms right now." : "No rooms found."}
            {isAdmin ? " Add the first room above." : ""}
          </div>
        ) : (
          <>
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Room ID</th>
                  <th>Room No.</th>
                  <th>Type</th>
                  <th>Price / Night</th>
                  <th>Status</th>
                  {isAdmin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr
                    key={room.roomId}
                    className={`room-row${isAdmin ? " clickable" : ""}${
                      selectedRoom?.roomId === room.roomId ? " selected" : ""
                    }`}
                    onClick={() => handleRowClick(room)}
                  >
                    <td style={{ color: "#9aa3b2", fontSize: "13px" }}>{room.roomId ?? "—"}</td>

                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>{typeEmoji(room.roomType)}</span>
                        <strong style={{ color: "#003580" }}>{room.roomNumber ?? "—"}</strong>
                      </span>
                    </td>

                    <td>
                      <span className={`badge badge-${(room.roomType ?? "").toLowerCase()}`}>
                        {room.roomType ?? "—"}
                      </span>
                    </td>

                    <td>
                      <strong style={{ color: "#003580", fontSize: "15px" }}>
                        {room.price != null ? `₹${Number(room.price).toLocaleString("en-IN")}` : "—"}
                      </strong>
                      <span style={{ color: "#9aa3b2", fontSize: "12px" }}> /night</span>
                    </td>

                    <td>
                      <span className={`status ${statusClass(room.status)}`}>
                        {room.status ?? "Unknown"}
                      </span>
                    </td>

                    {isAdmin && (
                      <td className="action-hint">
                        {selectedRoom?.roomId === room.roomId
                          ? <span style={{ color: "#0071c2", fontWeight: 600 }}>✅ Selected</span>
                          : "Click to edit"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer">
              Showing <strong>{filteredRooms.length}</strong> of <strong>{rooms.length}</strong> rooms
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomList;