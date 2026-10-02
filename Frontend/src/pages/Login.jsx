import React, { useState } from "react";
import { loginUser } from "../services/userService";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const loginStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f5f8;
  padding: 24px;
  font-family: 'DM Sans', sans-serif;
}

.login-split {
  display: flex;
  width: 100%;
  max-width: 900px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,53,128,0.12);
  border: 1px solid #e8edf3;
}

.login-left {
  background: linear-gradient(150deg, #003580 0%, #0071c2 100%);
  flex: 1;
  padding: 52px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  width: 300px; height: 300px;
  background: rgba(254,187,2,0.08);
  border-radius: 50%;
  top: -80px; right: -80px;
  pointer-events: none;
}

.login-left::after {
  content: '';
  position: absolute;
  width: 200px; height: 200px;
  background: rgba(255,255,255,0.04);
  border-radius: 50%;
  bottom: -40px; left: -40px;
  pointer-events: none;
}

.login-left-brand {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.login-left-tag {
  color: #febb02;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 36px;
}

.login-left-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: rgba(255,255,255,0.82);
  font-size: 14px;
}

.login-left-feature-icon {
  width: 32px; height: 32px;
  background: rgba(254,187,2,0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.login-right {
  flex: 1;
  padding: 52px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-right h2 {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  color: #003580;
  margin-bottom: 6px;
}

.login-right .subtitle {
  color: #6b7a99;
  font-size: 14px;
  margin-bottom: 32px;
}

.login-field { margin-bottom: 18px; }

.login-field label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #374151;
  margin-bottom: 7px;
}

.login-field input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1.5px solid #d1d9e6;
  background: #f8fafc;
  color: #1a1a2e;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
  box-sizing: border-box;
}

.login-field input:focus {
  border-color: #0071c2;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0,113,194,0.1);
  background: #fff;
}

.login-submit {
  width: 100%;
  margin-top: 8px;
  padding: 13px;
  background: #0071c2;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-submit:hover { background: #005ea8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,113,194,0.25); }
.login-submit:active { transform: translateY(0); }
.login-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

.login-error {
  margin-top: 14px;
  padding: 11px 14px;
  background: #fff0f0;
  border: 1px solid #ffd0d0;
  border-radius: 8px;
  color: #cc0000;
  font-size: 13px;
  text-align: center;
}

.login-register-link {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #6b7a99;
}

.login-register-link a {
  color: #0071c2;
  font-weight: 600;
  text-decoration: none;
}

.login-register-link a:hover { text-decoration: underline; }

.login-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .login-split { flex-direction: column; }
  .login-left  { padding: 36px 28px; }
  .login-right { padding: 36px 28px; }
}
`;

function extractRoleFromJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    let raw = payload.role || payload.roles || payload.authorities || payload.scope || payload.ROLE || null;
    if (Array.isArray(raw)) raw = raw[0];
    if (raw && typeof raw === "object" && raw.authority) raw = raw.authority;
    if (!raw) return null;
    raw = String(raw).toUpperCase().trim();
    if (raw.startsWith("ROLE_")) raw = raw.slice(5);
    return raw;
  } catch { return null; }
}

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) { setError("Please enter your credentials."); return; }
    setLoading(true); setError("");
    try {
      const res  = await loginUser(username, password);
      const data = res.data || res;
      const token = data.token;
      if (!token) { setError("Token not received from backend."); return; }

      let role = data.role || extractRoleFromJWT(token);
      if (role) { role = String(role).toUpperCase().trim(); if (role.startsWith("ROLE_")) role = role.slice(5); }

      localStorage.setItem("token",      token);
      localStorage.setItem("role",       role || "");
      localStorage.setItem("username",   data.username || username);
      localStorage.setItem("customerId", data.customerId || data.userId || "");

      login({ username: data.username || username, role: role || "", customerId: data.customerId || data.userId || "" }, token);
      if (setIsLoggedIn) setIsLoggedIn(true);
      alert(`Login Successful ✅  (Role: ${role || "unknown"})`);
      navigate("/");
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{loginStyles}</style>
      <div className="login-page">
        <div className="login-split">
          {/* Left panel */}
          <div className="login-left">
            <div className="login-left-brand">🏨 Hotel Hub</div>
            <div className="login-left-tag">Staff Portal</div>
            {[
              { icon: "🔐", text: "Secure role-based access" },
              { icon: "📅", text: "Manage bookings instantly" },
              { icon: "📊", text: "Real-time dashboard analytics" },
              { icon: "🛏",  text: "Full room management control" },
            ].map((f, i) => (
              <div key={i} className="login-left-feature">
                <div className="login-left-feature-icon">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div className="login-right">
            <h2>Welcome back</h2>
            <p className="subtitle">Sign in to your staff account to continue</p>

            <div className="login-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="login-submit" onClick={handleLogin} disabled={loading}>
              {loading && <span className="login-spinner" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/*<div className="login-register-link">
              Don't have an account? <Link to="/register">Create one</Link>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
