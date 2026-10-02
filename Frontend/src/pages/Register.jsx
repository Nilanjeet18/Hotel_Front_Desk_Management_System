import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const registerStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f5f8;
  padding: 24px;
  font-family: 'DM Sans', sans-serif;
}

.register-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,53,128,0.12);
  border: 1px solid #e8edf3;
}

.register-card-header {
  background: linear-gradient(135deg, #003580 0%, #0071c2 100%);
  padding: 32px 40px;
  text-align: center;
}

.register-card-header-brand {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.register-card-header-tag {
  color: #febb02;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.register-card-body {
  padding: 36px 40px;
}

.register-role-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #374151;
  margin-bottom: 10px;
  display: block;
}

.register-role-strip {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.register-role-btn {
  flex: 1;
  padding: 12px 8px;
  border-radius: 10px;
  border: 1.5px solid #d1d9e6;
  background: #f8fafc;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}

.register-role-btn-icon { font-size: 22px; }

.register-role-btn-name {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7a99;
  transition: color 0.2s;
}

.register-role-btn.active {
  border-color: #0071c2;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(0,113,194,0.1);
}

.register-role-btn.active .register-role-btn-name { color: #0071c2; }
.register-role-btn:hover:not(.active) { border-color: #9aa3b2; background: #f0f4fa; }

.reg-field { margin-bottom: 18px; }

.reg-field label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #374151;
  margin-bottom: 7px;
}

.reg-field input {
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

.reg-field input:focus {
  border-color: #0071c2;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0,113,194,0.1);
  background: #fff;
}

.strength-bar { display: flex; gap: 4px; margin-top: 8px; }
.strength-seg {
  flex: 1; height: 3px; border-radius: 3px;
  background: #e8edf3;
  transition: background 0.4s;
}
.strength-seg.weak   { background: #cc0000; }
.strength-seg.fair   { background: #f97316; }
.strength-seg.good   { background: #febb02; }
.strength-seg.strong { background: #008009; }
.strength-label { font-size: 11px; color: #6b7a99; margin-top: 4px; }

.match-hint { font-size: 12px; margin-top: 5px; }
.match-hint.ok  { color: #008009; }
.match-hint.err { color: #cc0000; }

.register-submit {
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

.register-submit:hover { background: #005ea8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,113,194,0.25); }
.register-submit:active { transform: translateY(0); }
.register-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

.reg-toast {
  margin-top: 14px;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}
.reg-toast.error   { background: #fff0f0; border: 1px solid #ffd0d0; color: #cc0000; }
.reg-toast.success { background: #f0fff4; border: 1px solid #b8f0c0; color: #166534; }

.reg-login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #6b7a99;
}
.reg-login-link a { color: #0071c2; font-weight: 600; text-decoration: none; }
.reg-login-link a:hover { text-decoration: underline; }

.reg-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: rSpin 0.7s linear infinite;
}
@keyframes rSpin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .register-card-body { padding: 28px 24px; }
  .register-card-header { padding: 24px 28px; }
}
`;

const ROLES = [
  { value: "ADMIN",        label: "Admin",        icon: "🛡️" },
  { value: "RECEPTIONIST", label: "Receptionist", icon: "🛎️" },
  { value: "MANAGER",      label: "Manager",      icon: "👔" },
];

function getStrength(pwd) {
  if (!pwd) return { level: 0, label: "" };
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  return { level: score, label: ["", "Weak", "Fair", "Good", "Strong"][score] };
}

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [role,     setRole]     = useState("ADMIN");
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const strength      = getStrength(password);
  const strengthClass = ["", "weak", "fair", "good", "strong"][strength.level];

  const handleRegister = async () => {
    if (!username || !password) { setMessage({ type: "error", text: "Please fill in all fields." }); return; }
    if (password !== confirm)   { setMessage({ type: "error", text: "Passwords do not match." }); return; }

    setLoading(true); setMessage({ type: "", text: "" });
    try {
      const response = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Registration failed");
      }
      setMessage({ type: "success", text: "Account created successfully! Redirecting…" });
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Registration failed. Username may already exist." });
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{registerStyles}</style>
      <div className="register-page">
        <div className="register-card">
          <div className="register-card-header">
            <div className="register-card-header-brand">🏨 Hotel Hub</div>
            <div className="register-card-header-tag">Create Staff Account</div>
          </div>

          <div className="register-card-body">
            <span className="register-role-label">Select Your Role</span>
            <div className="register-role-strip">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  className={`register-role-btn${role === r.value ? " active" : ""}`}
                  onClick={() => setRole(r.value)}
                >
                  <span className="register-role-btn-icon">{r.icon}</span>
                  <span className="register-role-btn-name">{r.label}</span>
                </button>
              ))}
            </div>

            <div className="reg-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setMessage({ type: "", text: "" }); }}
              />
            </div>

            <div className="reg-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setMessage({ type: "", text: "" }); }}
              />
              {password && (
                <>
                  <div className="strength-bar">
                    {[1,2,3,4].map((n) => (
                      <div key={n} className={`strength-seg${strength.level >= n ? ` ${strengthClass}` : ""}`} />
                    ))}
                  </div>
                  <div className="strength-label">Strength: {strength.label}</div>
                </>
              )}
            </div>

            <div className="reg-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setMessage({ type: "", text: "" }); }}
              />
              {confirm && (
                <div className={`match-hint ${confirm === password ? "ok" : "err"}`}>
                  {confirm === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                </div>
              )}
            </div>

            {message.text && <div className={`reg-toast ${message.type}`}>{message.text}</div>}

            <button className="register-submit" onClick={handleRegister} disabled={loading}>
              {loading && <span className="reg-spinner" />}
              {loading ? "Creating Account…" : "Create Account"}
            </button>

            <div className="reg-login-link">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
