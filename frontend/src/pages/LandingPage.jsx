import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, fetchWithRetry, cacheResponse } from "../api.js";

export default function LandingPage() {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("");
  const [offline, setOffline] = useState(false);
  const [showCityTips, setShowCityTips] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithRetry(`${API_BASE_URL}/cities`)
      .then((res) => res.json())
      .then((data) => {
        setCities(data.cities || []);
        cacheResponse(`${API_BASE_URL}/cities`, data);
        setOffline(false);
      })
      .catch(() => {
        setCities([
          { id: "nagpur", name: "Nagpur" },
          { id: "pune", name: "Pune" },
          { id: "bengaluru", name: "Bengaluru" },
        ]);
        setOffline(true);
      });
  }, []);

  const handleExplore = () => {
    if (!city) return;
    navigate(`/listings/${city}`);
  };

  return (
    <main className="page">
      <div className="container">
        {offline && (
          <div style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: 6,
            padding: "12px 16px",
            marginBottom: 16,
            color: "#856404",
            fontSize: "0.9rem"
          }}>
            ⚠️ Network unavailable - using default cities
          </div>
        )}
        <div className="hero">
          <div>
            <h1 className="hero-title">Find safe and trusted rentals near colleges</h1>
            <p className="hero-subtitle">Shortlist verified rentals with clear trust and safety scores.</p>

            <div className="hero-panel">
              <h3>Start your search</h3>
              <div className="hero-actions">
                <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">Select city</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button className="button" onClick={handleExplore} disabled={!city}>Explore Rentals</button>
              </div>
              <div className="hero-note">Results ranked by trust, safety, and distance to college.</div>
            </div>

            <div className="pill-row">
              <div className="pill">✅ Verified owners</div>
              <div className="pill">🛡️ Locality safety scores</div>
              <div className="pill">🎓 Student‑friendly listings</div>
            </div>

            <div className="steps-row">
              <div className="card" style={{ padding: 12 }}>1. Choose city</div>
              <div className="card" style={{ padding: 12 }}>2. View trusted rentals</div>
              <div className="card" style={{ padding: 12 }}>3. Decide with confidence</div>
            </div>
          </div>

          <div className="preview-card">
            <div className="preview-title">Featured listing</div>
            <div className="preview-price">₹12,000/month</div>
            <div className="preview-row">
              <span>📍 2.5 km from college</span>
              <span>🛡️ 92</span>
            </div>
            <div className="preview-row">
              <span>✅ Trust 88</span>
              <span>PG • Verified</span>
            </div>
            <div style={{ marginTop: 10, color: "#6c757d", fontSize: "0.9rem" }}>
              Safe PG near VNIT campus, CCTV, no broker.
            </div>
          </div>
        </div>

        {/* New to City Helper */}
        <div className="card" style={{ marginTop: 40 }}>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>🌆 New to the City?</h2>
              <button 
                onClick={() => setShowCityTips(!showCityTips)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#0D6EFD",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: 600
                }}
              >
                {showCityTips ? "Hide Tips ▲" : "Show Tips ▼"}
              </button>
            </div>
            
            {showCityTips && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  {/* Nagpur Tips */}
                  <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8 }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 8, color: "#0D6EFD" }}>Nagpur</h3>
                    <ul style={{ fontSize: "0.9rem", color: "#495057", paddingLeft: 18, margin: 0 }}>
                      <li>Laxmi Nagar & Dharampeth are safe, near VNIT</li>
                      <li>Budget-friendly: ₹8k-15k/month</li>
                      <li>Metro buses connect major areas</li>
                      <li>Check for power backup (frequent cuts)</li>
                      <li>Visit property in evening for safety check</li>
                    </ul>
                  </div>

                  {/* Pune Tips */}
                  <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8 }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 8, color: "#0D6EFD" }}>Pune</h3>
                    <ul style={{ fontSize: "0.9rem", color: "#495057", paddingLeft: 18, margin: 0 }}>
                      <li>Kothrud & Karve Nagar are student hubs</li>
                      <li>PMPML bus pass saves ₹500-800/month</li>
                      <li>Monsoons: Check drainage & waterlogging</li>
                      <li>Verify warden/owner with college seniors</li>
                      <li>Negotiate rent if staying 11+ months</li>
                    </ul>
                  </div>

                  {/* Bengaluru Tips */}
                  <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8 }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 8, color: "#0D6EFD" }}>Bengaluru</h3>
                    <ul style={{ fontSize: "0.9rem", color: "#495057", paddingLeft: 18, margin: 0 }}>
                      <li>HSR Layout & Koramangala have metro access</li>
                      <li>Traffic is heavy—stay near workplace/college</li>
                      <li>Higher rent: ₹12k-25k/month typical</li>
                      <li>Water supply varies—ask about tanker costs</li>
                      <li>Safety: Check locality on Google after 9PM</li>
                    </ul>
                  </div>
                </div>

                {/* General Safety Tips */}
                <div style={{ marginTop: 16, background: "#fff3cd", padding: 16, borderRadius: 8 }}>
                  <h4 style={{ fontSize: "1rem", marginBottom: 8, color: "#856404" }}>🔒 General Safety Tips</h4>
                  <ul style={{ fontSize: "0.85rem", color: "#856404", paddingLeft: 18, margin: 0 }}>
                    <li>Always visit the property before paying advance</li>
                    <li>Verify owner identity (check property documents)</li>
                    <li>Get written rental agreement—no verbal deals</li>
                    <li>Check police station distance & street lighting</li>
                    <li>Ask current tenants about owner responsiveness</li>
                    <li>Keep emergency contacts (police, ambulance, college)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
