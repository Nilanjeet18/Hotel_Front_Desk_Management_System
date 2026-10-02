import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

const normalizeStatus = (status) => status?.toString().trim().toLowerCase();

const StatCard = ({ label, value, sub, accent }) => (
  <div className={`stat-card${accent ? ` accent-${accent}` : ""}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0, occupiedRooms: 0, availableRooms: 0,
    todayCheckIns: 0, todayRevenue: 0, totalBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData,    setRevenueData]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true); setError(null);
    try {
      const token   = localStorage.getItem("token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const [roomsRes, bookingsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/rooms`,        headers),
        axios.get(`${BASE_URL}/api/bookings/all`, headers),
      ]);
      const rooms    = roomsRes.data    || [];
      const bookings = bookingsRes.data || [];

      const totalRooms     = rooms.length;
      const occupiedRooms  = rooms.filter((r) => normalizeStatus(r.status) === "booked").length;
      const availableRooms = rooms.filter((r) => normalizeStatus(r.status) === "available").length;

      const today = new Date().toISOString().split("T")[0];
      const todayCheckIns = bookings.filter((b) =>
        new Date(b.checkInDate || b.checkIn).toISOString().split("T")[0] === today
      ).length;
      const todayRevenue = bookings
        .filter((b) =>
          new Date(b.checkInDate || b.checkIn).toISOString().split("T")[0] === today &&
          normalizeStatus(b.status) === "confirmed"
        )
        .reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);

      setStats({ totalRooms, occupiedRooms, availableRooms, todayCheckIns, todayRevenue, totalBookings: bookings.length });

      const sorted = [...bookings]
        .sort((a, b) => new Date(b.createdAt || b.checkIn) - new Date(a.createdAt || a.checkIn))
        .slice(0, 5);
      setRecentBookings(sorted);

      const months   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const monthMap = {};
      bookings.forEach((b) => {
        if (normalizeStatus(b.status) === "confirmed") {
          const m = months[new Date(b.checkInDate || b.checkIn).getMonth()];
          monthMap[m] = (monthMap[m] || 0) + (b.totalAmount || b.amount || 0);
        }
      });
      const arr = months.filter((m) => monthMap[m]).map((m) => ({ month: m, revenue: monthMap[m] }));
      setRevenueData(arr.length ? arr : [{ month: "No Data", revenue: 0 }]);

    } catch (err) {
      console.error(err);
      setError("❌ Data load error. Try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval  = setInterval(fetchDashboardData, 5000);
    const onUpdate  = () => fetchDashboardData();
    window.addEventListener("roomUpdated", onUpdate);
    return () => { clearInterval(interval); window.removeEventListener("roomUpdated", onUpdate); };
  }, []);

  const occupancyData = [
    { name: "Booked",    value: stats.occupiedRooms  },
    { name: "Available", value: stats.availableRooms },
  ];
  const PIE_COLORS = ["#cc0000", "#008009"];

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d) ? "N/A" : d.toLocaleDateString("en-IN");
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px", color: "#6b7a99" }}>
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
      Loading dashboard...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "80px" }}>
      <div className="alert alert-danger" style={{ display: "inline-block" }}>{error}</div>
    </div>
  );

  return (
    <div className="dashboard-page">
      {/* ── Header ── */}
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>⚙️ Admin Dashboard</h1>
          <p>Real-time hotel operations overview</p>
        </div>
        <button className="dashboard-refresh" onClick={fetchDashboardData}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid-3" style={{ marginBottom: "24px" }}>
        <StatCard label="Total Rooms"     value={stats.totalRooms}    sub="Hotel capacity" />
        <StatCard label="Rooms Booked"    value={stats.occupiedRooms} sub="Currently occupied" accent="red" />
        <StatCard label="Available"       value={stats.availableRooms} sub="Ready to book" accent="green" />
        <StatCard label="Today Check-Ins" value={stats.todayCheckIns} sub={new Date().toLocaleDateString("en-IN")} />
        <StatCard label="Today Revenue"   value={`₹${stats.todayRevenue.toLocaleString("en-IN")}`} sub="Confirmed bookings" accent="gold" />
        <StatCard label="Total Bookings"  value={stats.totalBookings} sub="All time" />
      </div>

      {/* ── Charts ── */}
      <div className="grid-2" style={{ marginBottom: "24px" }}>
        <div className="chart-card">
          <h3>📊 Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4fa" />
              <XAxis dataKey="month" tick={{ fill: "#6b7a99", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6b7a99", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: "8px", color: "#1a1a2e" }}
                formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#0071c2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🏨 Room Occupancy</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={occupancyData} dataKey="value" outerRadius={90} innerRadius={45} paddingAngle={3}>
                {occupancyData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Legend
                formatter={(value) => <span style={{ color: "#374151", fontSize: "13px" }}>{value}</span>}
              />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Bookings ── */}
      <div className="chart-card">
        <h3>🗒️ Recent Bookings</h3>
        <div className="rooms-card" style={{ boxShadow: "none", border: "1px solid #e8edf3", marginTop: "16px" }}>
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer ID</th>
                <th>Room ID</th>
                <th>Check-In</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "#9aa3b2" }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                recentBookings.map((b, idx) => (
                  <tr key={idx}>
                    <td><strong style={{ color: "#003580" }}>#{b.bookingId || "N/A"}</strong></td>
                    <td>{b.customerId || "N/A"}</td>
                    <td>#{b.roomId || "N/A"}</td>
                    <td>{formatDate(b.checkInDate || b.checkIn)}</td>
                    <td><strong>₹{(b.totalAmount || b.amount || 0).toLocaleString("en-IN")}</strong></td>
                    <td>
                      <span className={`status status-${(b.status || "unknown").toLowerCase()}`}>
                        {b.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
