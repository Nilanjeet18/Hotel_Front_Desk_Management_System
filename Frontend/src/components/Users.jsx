import React, { useState, useEffect } from "react";
import {
  getUsers,
  registerUser,
  updateUser,
  deleteUser,
} from "../services/userService";

const ROLES = ["RECEPTIONIST", "MANAGER"];

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Logged-in admin's own username — used to block self edit/delete
  const currentUsername = localStorage.getItem("username") || "";

  // form state — used for both Add and Edit
  const [editingId, setEditingId] = useState(null); // null => Add mode
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "RECEPTIONIST",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError(
        err.response?.status === 403
          ? "Access denied. Admin only."
          : "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ username: "", password: "", role: "RECEPTIONIST" });
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const startEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      password: "", // leave blank => unchanged
      role: (user.role || "").replace("ROLE_", ""),
    });
    document.getElementById("staff-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!formData.username || (!editingId && !formData.password)) {
      setError("Username and password are required.");
      return;
    }
    setError("");
    try {
      if (editingId) {
        await updateUser(editingId, {
          username: formData.username,
          role: formData.role,
          password: formData.password, // optional
        });
        showSuccess("✅ Staff updated successfully!");
      } else {
        await registerUser(formData.username, formData.password, formData.role);
        showSuccess("✅ Staff added successfully!");
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Operation failed. Try again."
      );
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    try {
      await deleteUser(user.id);
      showSuccess("🗑️ User deleted successfully!");
      fetchUsers();
    } catch (err) {
      setError(
        err.response?.status === 403
          ? "Access denied."
          : "Delete failed. Try again."
      );
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>👥 Staff Management</h1>
        <p>Add, update or remove Receptionist / Manager accounts</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Add / Edit Form ── */}
      <div id="staff-form" className="manage-rooms-card">
        <h2 className="card-title">{editingId ? "✏️ Edit Staff" : "➕ Add Staff"}</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>Username *</label>
            <input
              name="username"
              placeholder="e.g. rutu_reception"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{editingId ? "Password (leave blank to keep unchanged)" : "Password *"}</label>
            <input
              name="password"
              type="password"
              placeholder={editingId ? "New password (optional)" : "Enter password"}
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-add" onClick={handleSubmit}>
            {editingId ? "💾 Save Changes" : "➕ Add Staff"}
          </button>
          {editingId && (
            <button className="btn btn-clear" onClick={resetForm}>
              ✖ Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className="rooms-card" style={{ marginTop: "20px" }}>
        {loading ? (
          <div className="empty-state">
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.username === currentUsername;
                return (
                  <tr key={user.id} className={editingId === user.id ? "selected" : ""}>
                    <td style={{ color: "#9aa3b2", fontSize: "13px" }}>{user.id}</td>
                    <td>
                      <strong style={{ color: "#003580" }}>{user.username}</strong>
                      {isSelf && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            color: "#febb02",
                            border: "1px solid #febb02",
                            borderRadius: "10px",
                            padding: "1px 8px",
                          }}
                        >
                          You
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge">
                        {(user.role || "").replace("ROLE_", "")}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {isSelf ? (
                        <span style={{ color: "#9aa3b2", fontSize: "12px" }}>
                          — cannot edit/delete own account
                        </span>
                      ) : (
                        <>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "5px 10px", fontSize: "12px", marginRight: "6px" }}
                            onClick={() => startEdit(user)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "5px 10px", fontSize: "12px" }}
                            onClick={() => handleDelete(user)}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Users;