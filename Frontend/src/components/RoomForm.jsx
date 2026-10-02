import { useState, useEffect } from "react";
import { addRoom, updateRoom, deleteRoom } from "../services/roomService";

const ROOM_TYPES     = ["Single", "Double", "Suite", "Deluxe", "Family"];
const STATUS_OPTIONS = ["Available", "Booked", "Maintenance"];

/**
 * RoomForm — shown ONLY to logged-in users.
 * Java Room model: roomId | roomNumber | roomType | price | status
 */
const RoomForm = ({ selectedRoom, onSuccess, onClear }) => {
  const [formData, setFormData] = useState({
    roomId:     "",
    roomNumber: "",
    roomType:   "",
    price:      "",
    status:     "Available",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRoom) {
      setFormData({
        roomId:     selectedRoom.roomId     ?? "",
        roomNumber: String(selectedRoom.roomNumber ?? ""),
        roomType:   selectedRoom.roomType   ?? "",
        price:      String(selectedRoom.price ?? ""),
        status:     selectedRoom.status     ?? "Available",
      });
      setError("");
    }
  }, [selectedRoom]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetForm = () => {
    setFormData({ roomId: "", roomNumber: "", roomType: "", price: "", status: "Available" });
    setError("");
    if (onClear) onClear();
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!formData.roomNumber || !formData.roomType || !formData.price) {
      setError("Room Number, Type, and Price are required.");
      return;
    }
    setError(""); setLoading(true);
    try {
      await addRoom({ roomNumber: formData.roomNumber, roomType: formData.roomType, price: Number(formData.price), status: formData.status });
      showSuccess("✅ Room added successfully!");
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!formData.roomId) { setError("Click a room row to select it first."); return; }
    setError(""); setLoading(true);
    try {
      await updateRoom(formData.roomId, { roomNumber: formData.roomNumber, roomType: formData.roomType, price: Number(formData.price), status: formData.status });
      showSuccess("✅ Room updated successfully!");
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!formData.roomId) { setError("Click a room row to select it first."); return; }
    if (!window.confirm(`Delete Room No. ${formData.roomNumber} (ID: ${formData.roomId})?`)) return;
    setError(""); setLoading(true);
    try {
      await deleteRoom(formData.roomId);
      showSuccess("🗑️ Room deleted successfully!");
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="manage-rooms-card">
      <h2 className="card-title">Manage Rooms</h2>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label>Room ID (for Update / Delete)</label>
          <input
            name="roomId"
            value={formData.roomId}
            readOnly
            placeholder="Auto-filled on row click"
          />
          <span className="hint">Click a room row below to auto-fill</span>
        </div>

        <div className="form-group">
          <label>Room Number *</label>
          <input
            name="roomNumber"
            placeholder="e.g. 101"
            value={formData.roomNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Room Type *</label>
          <select name="roomType" value={formData.roomType} onChange={handleChange}>
            <option value="">Select type</option>
            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Price per Night (₹) *</label>
          <input
            name="price"
            type="number"
            placeholder="e.g. 2500"
            value={formData.price}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn-add"    onClick={handleAdd}    disabled={loading}>➕ Add Room</button>
        <button className="btn btn-update" onClick={handleUpdate} disabled={loading}>✏️ Update</button>
        <button className="btn btn-delete" onClick={handleDelete} disabled={loading}>🗑️ Delete</button>
        {formData.roomId && (
          <button className="btn btn-clear" onClick={resetForm}>✖ Clear</button>
        )}
      </div>
    </div>
  );
};

export default RoomForm;
