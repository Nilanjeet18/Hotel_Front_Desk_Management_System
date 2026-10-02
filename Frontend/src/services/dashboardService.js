import axios from "axios";

const API_URL = "http://localhost:8080/api/dashboard";

export const getDashboardStats = () =>
  axios.get(`${API_URL}/stats`);

export const getRevenueData = () =>
  axios.get(`${API_URL}/revenue`);