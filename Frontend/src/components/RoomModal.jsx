import React from "react";   // ✅ ADD THIS
import { useNavigate } from "react-router-dom";

function RoomModal({ isOpen, onClose, room }) {
  const navigate = useNavigate();

  if (!isOpen || !room) return null;

  const statusClass =
    room.status === "Available"
      ? "badge-available"
      : room.status === "Occupied"
      ? "badge-occupied"
      : "badge-maintenance";

  const handleBookNow = () => {
    onClose();
    navigate("/booking", { state: { roomId: room.roomId } });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>🛏 Room {room.roomNumber}</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#888" }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          <div className="invoice-row">
            <span style={{ color: "#777" }}>Room Number</span>
            <span>{room.roomNumber}</span>
          </div>
          <div className="invoice-row">
            <span style={{ color: "#777" }}>Room Type</span>
            <span>{room.roomType}</span>
          </div>
          <div className="invoice-row">
            <span style={{ color: "#777" }}>Price per Night</span>
            <span>₹{Number(room.price).toLocaleString()}</span>
          </div>
          <div className="invoice-row">
            <span style={{ color: "#777" }}>Status</span>
            <span className={`badge ${statusClass}`}>{room.status}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {room.status === "Available" && (
            <button className="btn btn-success" onClick={handleBookNow} style={{ flex: 1 }}>
              📅 Book Now
            </button>
          )}
          <button className="btn btn-danger" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomModal;
