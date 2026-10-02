const team = [
  { name: "Gourav", role: "Manager",                     emoji: "👨‍💼" },
  { name: "Nil",    role: "Head Chef & Admin",            emoji: "👩‍🍳" },
  { name: "Shiv",   role: "Front Desk Manager",           emoji: "👨‍💻" },
];

function About() {
  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <h1>About Our Hotel</h1>
        <p>Learn more about us and our commitment to excellence</p>
      </div>

      {/* ── Our Story ── */}
      <div className="card" style={{ marginBottom: "32px" }}>
        <h2>Our Story</h2>
        <p style={{ lineHeight: 1.85, color: "#374151", fontSize: "15px" }}>
          Welcome to Hotel Hub! We are dedicated to providing you with the best experience possible.
          Our hotel offers a variety of world-class amenities including a swimming pool, fitness center,
          and complimentary breakfast. Located in the heart of Pune, we make it easy for you to explore
          local attractions and dining options. Whether you're here for business or leisure, we strive
          to make your stay comfortable and enjoyable. Thank you for choosing our hotel!
        </p>
      </div>

      {/* ── Meet the Team ── */}
      <div className="section-heading">
        <h2>Meet Our Team</h2>
        <p>The people who make your stay exceptional</p>
      </div>

      <div className="grid-3" style={{ marginBottom: "32px" }}>
        {team.map((member, i) => (
          <div key={i} className="feature-card">
            <div className="icon">{member.emoji}</div>
            <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>{member.name}</h3>
            <p style={{ color: "#6b7a99", fontWeight: 500 }}>{member.role}</p>
          </div>
        ))}
      </div>

      {/* ── Location & Contact ── */}
      <div className="card">
        <h2>📍 Location & Contact</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: "20px", marginTop: "16px" }}>
          <div>
            <p style={{ fontWeight: 700, color: "#003580", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Address</p>
            <p style={{ color: "#374151", lineHeight: 1.7 }}>123, Hotel Street<br/>Pune, Maharashtra – 411001<br/>India</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "#003580", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Contact</p>
            <p style={{ color: "#374151", lineHeight: 1.7 }}>📞 +91 98765 43210<br/>✉️ info@hotelhub.com<br/>⏰ 24/7 Front Desk</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "#003580", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Hours</p>
            <p style={{ color: "#374151", lineHeight: 1.7 }}>Check-in: 2:00 PM<br/>Check-out: 11:00 AM<br/>Breakfast: 7–11 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
