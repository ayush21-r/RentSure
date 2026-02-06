import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, fetchWithRetry, cacheResponse } from "../api.js";
import RentalCard from "../components/RentalCard.jsx";

export default function ListingsPage() {
  const { city } = useParams();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [budgetMax, setBudgetMax] = useState(30000);
  const [genderFilter, setGenderFilter] = useState("any");
  const [searchQuery, setSearchQuery] = useState("");
  const [rankBy, setRankBy] = useState("match");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Rentals");
  const [subtitle, setSubtitle] = useState("Loading rentals...");
  const [offline, setOffline] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedOffice, setSelectedOffice] = useState("");
  const [colleges, setColleges] = useState([]);
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    fetchWithRetry(`${API_BASE_URL}/cities`)
      .then((res) => res.json())
      .then((data) => {
        setCities(data.cities || []);
        cacheResponse(`${API_BASE_URL}/cities`, data);
      })
      .catch(() => setCities([
        { id: "nagpur", name: "Nagpur" },
        { id: "pune", name: "Pune" },
        { id: "bengaluru", name: "Bengaluru" },
      ]));
  }, []);

  useEffect(() => {
    if (!city) return;
    const cityMeta = {
      pune: {
        colleges: ["COEP", "Symbiosis", "MIT-WPU", "Fergusson College", "PICT"],
        offices: ["Hinjewadi IT Park", "Magarpatta", "Kharadi EON", "Baner Business Bay", "Viman Nagar Hub"],
      },
      bengaluru: {
        colleges: ["Christ University", "St. Joseph's", "PES", "IIM-B", "RVCE"],
        offices: ["Manyata Tech Park", "Koramangala Startup Hub", "Sarjapur ORR", "HSR Sector 2", "Whitefield ITPL"],
      },
      nagpur: {
        colleges: ["VNIT", "RTMNU", "YCCE", "RCOEM", "LIT", "SB JAIN"],
        offices: ["MIHAN", "Civil Lines", "Sitabuldi", "Sadar Market", "Dharampeth Hub"],
      },
    };
    const meta = cityMeta[city] || { colleges: [], offices: [] };
    setColleges(meta.colleges);
    setOffices(meta.offices);
  }, [city]);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    const trimmedQuery = searchQuery.trim();
    const endpoint = trimmedQuery
      ? `${API_BASE_URL}/search?city=${city}&query=${encodeURIComponent(trimmedQuery)}&rank_by=${rankBy}&top_n=10`
      : `${API_BASE_URL}/recommendations?city=${city}&top_n=5`;

    fetchWithRetry(endpoint)
      .then((res) => res.json())
      .then((data) => {
        setTitle(`Rentals in ${data.city || city.toUpperCase()}`);
        if (trimmedQuery) {
          const resultCount = data.results ? data.results.length : 0;
          setSubtitle(`${resultCount} results • Ranked by ${rankBy}`);
          setRentals(data.results || []);
        } else {
          const recCount = data.recommendations ? data.recommendations.length : 0;
          setSubtitle(`${recCount} properties • Sorted by suitability`);
          setRentals(data.recommendations || []);
        }
        cacheResponse(endpoint, data);
        setOffline(false);
      })
      .catch(() => {
        setSubtitle("Offline - using cached data if available");
        setRentals([]);
        setOffline(true);
      })
      .finally(() => setLoading(false));
  }, [city, searchQuery, rankBy]);

  const handleCityChange = (e) => {
    const nextCity = e.target.value;
    if (!nextCity) return;
    navigate(`/listings/${nextCity}`);
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
            ⚠️ Network unavailable - showing cached data if available
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{title}</div>
            <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>{subtitle}</div>
            {city === "nagpur" && (
              <div style={{ marginTop: 6, color: "#495057", fontSize: "0.85rem" }}>
                Tier‑2 focus: Nagpur verified rentals
              </div>
            )}
          </div>
          <div className="filter-row">
            <select className="select" value={city || ""} onChange={handleCityChange}>
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              Verified only
            </label>
          </div>
        </div>

        {/* College & Office Proximity Selector */}
        <div style={{ 
          background: "linear-gradient(135deg, #f0f8ff 0%, #e7f3ff 100%)", 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          border: "1px solid #b8d4f1",
          boxShadow: "0 2px 8px rgba(13, 110, 253, 0.08), inset 0 1px 2px rgba(13, 110, 253, 0.05)",
          position: "relative"
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(13, 110, 253, 0.12), inset 0 1px 2px rgba(13, 110, 253, 0.05)"}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(13, 110, 253, 0.08), inset 0 1px 2px rgba(13, 110, 253, 0.05)"}
        >
          <div style={{ gridColumn: "1/-1", fontSize: "0.8rem", color: "#0D6EFD", fontWeight: 600, marginBottom: "-6px", marginTop: "-4px" }}>
            ✨ Find Your Nearest Room
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#0D6EFD", fontWeight: 600, marginBottom: 4, display: "block" }}>
              📚 Select Your College
            </label>
            <select 
              className="select"
              value={selectedCollege} 
              onChange={(e) => setSelectedCollege(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">All Colleges</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#0D6EFD", fontWeight: 600, marginBottom: 4, display: "block" }}>
              🏢 Select Your Office
            </label>
            <select 
              className="select"
              value={selectedOffice} 
              onChange={(e) => setSelectedOffice(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">All Office Hubs</option>
              {offices.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div style={{ 
          background: "#f8f9fa", 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12
        }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#495057", marginBottom: 4, display: "block" }}>
              Smart Search
            </label>
            <input
              className="input"
              placeholder="Search by area, college, or office hub"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#495057", marginBottom: 4, display: "block" }}>
              Rank By
            </label>
            <select
              className="select"
              value={rankBy}
              onChange={(e) => setRankBy(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="match">Best Match</option>
              <option value="college">Closest to College</option>
              <option value="office">Closest to Office</option>
              <option value="safety">Highest Safety</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#495057", marginBottom: 4, display: "block" }}>
              Max Budget: ₹{budgetMax.toLocaleString("en-IN")}
            </label>
            <input 
              type="range" 
              min="5000" 
              max="30000" 
              step="1000" 
              value={budgetMax}
              onChange={(e) => setBudgetMax(parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#495057", marginBottom: 4, display: "block" }}>
              Gender Preference
            </label>
            <select 
              className="select" 
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ color: "#6c757d" }}>Loading rentals...</div>
        ) : (
          <div className="grid">
            {rentals
              .filter((r) => {
                if (verifiedOnly && r.trust_score < 85) return false;
                if (r.rent > budgetMax) return false;
                if (genderFilter !== "any" && r.gender_preference && r.gender_preference !== "any" && r.gender_preference !== genderFilter) return false;
                if (selectedCollege && r.nearby_college !== selectedCollege) return false;
                if (selectedOffice && r.nearby_office_hub !== selectedOffice) return false;
                return true;
              })
              .sort((a, b) => {
                if (selectedCollege) {
                  return (a.college_distance_km || a.distance_km || 0) - (b.college_distance_km || b.distance_km || 0);
                }
                if (selectedOffice) {
                  return (a.office_distance_km || a.distance_km || 0) - (b.office_distance_km || b.distance_km || 0);
                }
                return 0;
              })
              .map((rental) => {
                let distanceNote = "";
                if (selectedCollege) {
                  const dist = (rental.college_distance_km || rental.distance_km || 0).toFixed(1);
                  distanceNote = `📍 ${dist}km to ${selectedCollege}`;
                } else if (selectedOffice) {
                  const dist = (rental.office_distance_km || rental.distance_km || 0).toFixed(1);
                  distanceNote = `📍 ${dist}km to ${selectedOffice}`;
                }
                return (
                  <div key={rental.property_id}>
                    <RentalCard rental={rental} />
                    {distanceNote && (
                      <div style={{ 
                        fontSize: "0.8rem", 
                        color: "#0D6EFD", 
                        padding: "8px 10px", 
                        background: "#e7f3ff", 
                        borderRadius: "0 0 8px 8px", 
                        marginTop: "-1px", 
                        textAlign: "center",
                        fontWeight: 600
                      }}>
                        {distanceNote}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </main>
  );
}
