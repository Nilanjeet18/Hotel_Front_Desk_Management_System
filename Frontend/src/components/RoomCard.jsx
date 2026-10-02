import React from "react";   // ✅ ADD THIS
import { useState } from "react";
import RoomModal from "./RoomModal";

function RoomCard({ room, refreshRooms }) {
  const [open, setOpen] = useState(false);

  const statusClass =
    room.status === "Available"
      ? "badge-available"
      : room.status === "Occupied"
      ? "badge-occupied"
      : "badge-maintenance";

  const roomIcons = {
    Deluxe: "🌟",
    Suite: "👑",
    Standard: "🏠",
    Executive: "💼",
  };

  return (
    <>
      <div className="room-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3>
            {roomIcons[room.roomType] || "🛏"} Room {room.roomNumber}
          </h3>
          <span className={`badge ${statusClass}`}>{room.status}</span>
        </div>

        <p><strong>Type:</strong> {room.roomType}</p>
        <p><strong>Price:</strong> ₹{Number(room.price).toLocaleString()} / night</p>
        <p style={{ fontSize: "12px", color: "#aaa" }}>ID: #{room.roomId}</p>

        <button
          className="btn btn-primary"
          onClick={() => setOpen(true)}
          style={{ marginTop: "12px", width: "100%" }}
        >
          View Details
        </button>
      </div>

      <RoomModal
        isOpen={open}
        onClose={() => setOpen(false)}
        room={room}
      />
    </>
  );
}

export default RoomCard;
