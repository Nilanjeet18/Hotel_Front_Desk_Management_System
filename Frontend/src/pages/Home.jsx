import { Link } from "react-router-dom";

const features = [
  { icon: "🏊", title: "Swimming Pool",  desc: "Relax in our world-class swimming pool open 24/7 for guests." },
  { icon: "💪", title: "Fitness Center", desc: "Stay fit with our fully equipped modern gym and trainers." },
  { icon: "🍳", title: "Free Breakfast", desc: "Complimentary breakfast served every morning from 7am to 11am." },
  { icon: "📶", title: "Free Wi-Fi",     desc: "High-speed internet access throughout the hotel premises." },
  { icon: "🚗", title: "Free Parking",   desc: "Ample secure parking space available for all our guests." },
  { icon: "🛎️", title: "24/7 Service",   desc: "Our dedicated staff is available round-the-clock for your needs." },
];

const highlights = [
  { value: "200+", label: "Rooms Available" },
  { value: "15+",  label: "Years of Excellence" },
  { value: "4.8★", label: "Guest Rating" },
  { value: "50k+", label: "Happy Guests" },
];

function Home() {
  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero">
        <h1>Find Your Perfect Room</h1>
        <p>
          Experience luxury and comfort at its finest. Whether you're here for
          business or leisure, we have everything you need for an unforgettable stay.
        </p>
        <div className="hero-actions">
          <Link to="/booking" className="btn btn-gold" style={{ fontSize: "15px", padding: "13px 28px" }}>
            📅 Book a Room
          </Link>
          <Link to="/rooms" className="btn" style={{
            fontSize: "15px", padding: "13px 28px",
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            border: "1.5px solid rgba(255,255,255,0.35)",
          }}>
            🛏 View Rooms
          </Link>
        </div>
      </div>

      {/* ── Highlights Strip ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "40px",
      }}>
        {highlights.map((h, i) => (
          <div key={i} style={{
            background: "#fff",
            border: "1px solid #e8edf3",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#003580", fontFamily: "'Playfair Display', serif" }}>
              {h.value}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7a99", marginTop: "4px" }}>{h.label}</div>
          </div>
        ))}
      </div>

      {/* ── Amenities ── */}
      <div className="section-heading">
        <h2>Our Amenities</h2>
        <p>Everything you need for a perfect stay</p>
      </div>

      <div className="grid-3" style={{ marginBottom: "40px" }}>
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── CTA Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #003580, #0071c2)",
        borderRadius: "14px",
        padding: "40px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
        flexWrap: "wrap",
      }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#fff", marginBottom: "6px" }}>
            Ready to experience luxury?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px" }}>
            Book your room today and get the best rates guaranteed.
          </p>
        </div>
        <Link to="/booking" className="btn btn-gold" style={{ fontSize: "15px", padding: "13px 32px", flexShrink: 0 }}>
          Book Now →
        </Link>
      </div>
    </div>
  );
}

export default Home;
