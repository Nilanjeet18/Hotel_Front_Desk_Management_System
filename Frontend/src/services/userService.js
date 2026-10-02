import axios from "axios";

const API_URL = "http://localhost:8080/api/users";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    "Content-Type": "application/json",
  },
});

// ✅ LOGIN API — public
export const loginUser = async (username, password) => {
  const res = await axios.post(`${API_URL}/login`, { username, password });
  return res.data;
};

// ✅ ADD STAFF (Admin only) — role: "RECEPTIONIST" | "MANAGER" | "ADMIN"
export const registerUser = async (username, password, role) => {
  const res = await axios.post(
    `${API_URL}/register`,
    { username, password, role },
    authHeader()
  );
  return res.data;
};

// ✅ GET ALL USERS (Admin only)
export const getUsers = async () => {
  return axios.get(API_URL, authHeader());
};

// ✅ GET ONE USER (Admin only)
export const getUserById = async (id) => {
  return axios.get(`${API_URL}/${id}`, authHeader());
};

// ✅ UPDATE USER (Admin only) — password optional, omit/empty to keep unchanged
export const updateUser = async (id, { username, role, password }) => {
  const body = { username, role };
  if (password) body.password = password;
  const res = await axios.put(`${API_URL}/${id}`, body, authHeader());
  return res.data;
};

// ✅ DELETE USER (Admin only)
export const deleteUser = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, authHeader());
  return res.data;
};