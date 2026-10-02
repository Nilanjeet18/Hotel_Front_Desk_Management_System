// ============================================================
// roomService.js
// Backend Java fields: roomId | roomNumber | roomType | price | status
// ============================================================

const API_BASE = "http://localhost:8080/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// GET all rooms (public)
export const getAllRooms = async () => {
  const res = await fetch(`${API_BASE}/rooms`);
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
};

// POST add room — camelCase matches Java Room model
export const addRoom = async (roomData) => {
  const res = await fetch(`${API_BASE}/rooms`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      roomNumber: roomData.roomNumber,   // ✅ Java: private String roomNumber
      roomType:   roomData.roomType,     // ✅ Java: private String roomType
      price:      roomData.price,        // ✅ Java: private double price
      status:     roomData.status,       // ✅ Java: private String status
    }),
  });
  if (!res.ok) throw new Error("Failed to add room");
  return res.json();
};

// PUT update room
export const updateRoom = async (id, roomData) => {
  const res = await fetch(`${API_BASE}/rooms/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      roomNumber: roomData.roomNumber,
      roomType:   roomData.roomType,
      price:      roomData.price,
      status:     roomData.status,
    }),
  });
  if (!res.ok) throw new Error("Failed to update room");
  return res.json();
};

// DELETE room
export const deleteRoom = async (id) => {
  const res = await fetch(`${API_BASE}/rooms/${Number(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete room");
};
