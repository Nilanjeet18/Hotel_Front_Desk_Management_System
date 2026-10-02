import axios from "axios";

// NOTE: CustomerController is mapped at "/customers" — NOT under "/api"
const API_BASE = "http://localhost:8080/customers";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    "Content-Type": "application/json",
  },
});

// 🔍 Search customer by phone (primary lookup for walk-in guests)
export const searchCustomerByPhone = (phone) =>
  axios.get(`${API_BASE}/search/phone`, {
    ...authHeader(),
    params: { phone },
  });

// 🔍 Search customer by name
export const searchCustomerByName = (name) =>
  axios.get(`${API_BASE}/search/name`, {
    ...authHeader(),
    params: { name },
  });

// ➕ Create a new customer (name, email, phone, address)
export const createCustomer = (data) =>
  axios.post(API_BASE, data, authHeader());

// 📋 Get one customer
export const getCustomerById = (id) =>
  axios.get(`${API_BASE}/${id}`, authHeader());

// 📋 Get all customers (Admin / Receptionist)
export const getAllCustomers = () =>
  axios.get(API_BASE, authHeader());

// ✏️ Update customer
export const updateCustomer = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data, authHeader());

// 🗑️ Delete customer (Admin only)
export const deleteCustomer = (id) =>
  axios.delete(`${API_BASE}/${id}`, authHeader());

// 🧾 Customer's booking history
export const getCustomerHistory = (id) =>
  axios.get(`${API_BASE}/${id}/history`, authHeader());