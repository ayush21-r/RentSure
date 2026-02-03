import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL, fetchWithRetry, cacheResponse } from "../api.js";

export default function RentalDetailsPage() {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [proximity, setProximity] = useState(null);
  const [ownerTrust, setOwnerTrust] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);
  const [tiffin, setTiffin] = useState([]);
  const [agreementText, setAgreementText] = useState("");
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [agreementTenant, setAgreementTenant] = useState("");
  const [agreementStart, setAgreementStart] = useState("" + new Date().toISOString().slice(0, 10));
  const [agreementDeposit, setAgreementDeposit] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState({ status: "idle", transactionId: "" });
  const [expenseForm, setExpenseForm] = useState({ rent: 0, utilities: 0, roommates: 2 });
  const [expenseResult, setExpenseResult] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviews, setReviews] = useState([]);
  const [complaintForm, setComplaintForm] = useState({ subject: "", description: "", anonymous: false });
  const [complaints, setComplaints] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [showContactOwner, setShowContactOwner] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);

  useEffect(() => {
    fetchWithRetry(`${API_BASE_URL}/rental/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setDetails(data);
        cacheResponse(`${API_BASE_URL}/rental/${id}`, data);
        setOffline(false);
      })
      .catch(() => {
        setError("Rental not found or network unavailable");
        setOffline(true);
      });

    fetchWithRetry(`${API_BASE_URL}/trust-metrics`)
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        cacheResponse(`${API_BASE_URL}/trust-metrics`, data);
      })
      .catch(() => setMetrics(null));
  }, [id]);

  useEffect(() => {
    if (!details?.property?.property_id) return;
    const propertyId = details.property.property_id;

    fetchWithRetry(`${API_BASE_URL}/proximity/${propertyId}`)
      .then((res) => res.json())
      .then((data) => setProximity(data))
      .catch(() => setProximity(null));

    fetchWithRetry(`${API_BASE_URL}/neighborhood/${propertyId}`)
      .then((res) => res.json())
      .then((data) => setNeighborhood(data))
      .catch(() => setNeighborhood(null));

    fetchWithRetry(`${API_BASE_URL}/tiffin/${propertyId}`)
      .then((res) => res.json())
      .then((data) => setTiffin(data.options || []))
      .catch(() => setTiffin([]));

    if (details.property.owner_id) {
      fetchWithRetry(`${API_BASE_URL}/owner/${details.property.owner_id}/trust`)
        .then((res) => res.json())
        .then((data) => setOwnerTrust(data))
        .catch(() => setOwnerTrust(null));

      // Fetch owner details for contact modal
      fetchWithRetry(`${API_BASE_URL}/owner/${details.property.owner_id}`)
        .then((res) => res.json())
        .then((data) => setOwnerDetails(data))
        .catch(() => setOwnerDetails(null));
    }
  }, [details]);

  useEffect(() => {
    if (!details?.property) return;
    setPaymentAmount(details.property.rent || 0);
    setPaymentMethod(details.property.payment_methods?.[0] || "UPI");
    setExpenseForm((prev) => ({ ...prev, rent: details.property.rent || 0 }));
  }, [details]);

  if (error) {
    return (
      <main className="page">
        <div className="container">{error}</div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="page">
        <div className="container">Loading...</div>
      </main>
    );
  }

  const rental = details.property;

  const handleGenerateAgreement = async () => {
    setAgreementLoading(true);
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/agreement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: rental.property_id,
          tenant_name: agreementTenant || "Student Tenant",
          start_date: agreementStart,
          duration_months: 11,
          deposit_amount: agreementDeposit || 0,
        }),
      });
      const data = await res.json();
      setAgreementText(data.agreement_text || "");
    } catch {
      setAgreementText("Unable to generate agreement right now.");
    } finally {
      setAgreementLoading(false);
    }
  };

  const handleDownloadAgreement = () => {
    if (!agreementText) return;
    const blob = new Blob([agreementText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RentSure_Agreement_${rental.property_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInitiatePayment = async () => {
    setPaymentStatus({ status: "processing", transactionId: "" });
    try {
      const initRes = await fetchWithRetry(`${API_BASE_URL}/payment/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: rental.property_id,
          amount: paymentAmount,
          method: paymentMethod,
        }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error("Payment init failed");

      const confirmRes = await fetchWithRetry(`${API_BASE_URL}/payment/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: initData.transaction_id }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error("Payment confirm failed");

      setPaymentStatus({ status: confirmData.status, transactionId: initData.transaction_id });
    } catch {
      setPaymentStatus({ status: "failed", transactionId: "" });
    }
  };

  const handleSplitExpenses = async () => {
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/expenses/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_rent: Number(expenseForm.rent),
          utilities: Number(expenseForm.utilities),
          roommates: Number(expenseForm.roommates),
        }),
      });
      const data = await res.json();
      setExpenseResult(data);
    } catch {
      setExpenseResult(null);
    }
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
        <div style={{ marginBottom: 20 }}>
          <Link className="nav-link" to={`/listings/${details.city.toLowerCase()}`}>← Back to listings</Link>
        </div>

        {/* Hero Image Section */}
        {rental.image_url && (
          <div style={{ 
            width: "100%", 
            height: 400, 
            overflow: "hidden", 
            borderRadius: "12px",
            marginBottom: 24,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <img 
              src={rental.image_url} 
              alt={rental.property_id}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Photo Gallery Section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 12, color: "#212529" }}>
            🏠 Property Photos
          </div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
            gap: 12
          }}>
            {[
              { id: "apartment-1", label: "Master Bedroom" },
              { id: "apartment-2", label: "Living Room" },
              { id: "apartment-3", label: "Kitchen" },
              { id: "apartment-4", label: "Bathroom" },
              { id: "apartment-5", label: "Balcony View" },
              { id: "apartment-6", label: "Entrance" }
            ].map((photo, index) => (
              <div 
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                style={{
                  width: "100%",
                  height: "180px",
                  overflow: "hidden",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: currentPhotoIndex === index ? "3px solid #0D6EFD" : "2px solid #e9ecef",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  background: `linear-gradient(135deg, ${["#667eea", "#764ba2", "#f093fb", "#4facfe", "#00f2fe", "#43e97b"][index]} 0%, ${["#764ba2", "#f093fb", "#4facfe", "#00f2fe", "#43e97b", "#38f9d7"][index]} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "2rem"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "8px" }}>
                    {["🛏️", "🛋️", "🍳", "🚿", "🌅", "🚪"][index]}
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{photo.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Full-size Photo Modal */}
          {currentPhotoIndex !== null && (
            <div 
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 999,
                padding: "20px"
              }}
              onClick={() => setCurrentPhotoIndex(null)}
            >
              <div style={{ position: "relative", width: "100%", maxWidth: "700px" }}>
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "75%",
                    position: "relative",
                    background: `linear-gradient(135deg, ${["#667eea", "#764ba2", "#f093fb", "#4facfe", "#00f2fe", "#43e97b"][currentPhotoIndex]} 0%, ${["#764ba2", "#f093fb", "#4facfe", "#00f2fe", "#43e97b", "#38f9d7"][currentPhotoIndex]} 100%)`,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <div style={{ 
                    position: "absolute",
                    textAlign: "center",
                    color: "white"
                  }}>
                    <div style={{ fontSize: "6rem", marginBottom: "20px" }}>
                      {["🛏️", "🛋️", "🍳", "🚿", "🌅", "🚪"][currentPhotoIndex]}
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                      {["Master Bedroom", "Living Room", "Kitchen", "Bathroom", "Balcony View", "Entrance"][currentPhotoIndex]}
                    </div>
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => (prev - 1 + 6) % 6);
                  }}
                  style={{
                    position: "absolute",
                    left: "-60px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "white",
                    fontSize: "2rem",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.4)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                >
                  ◀
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPhotoIndex((prev) => (prev + 1) % 6);
                  }}
                  style={{
                    position: "absolute",
                    right: "-60px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "white",
                    fontSize: "2rem",
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.4)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                >
                  ▶
                </button>

                {/* Photo Counter */}
                <div style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: 600
                }}>
                  {currentPhotoIndex + 1} / 6
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Info Card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            {/* Header with Price and Overall Score */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, borderBottom: "1px solid #e9ecef", paddingBottom: 16 }}>
              <div>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0D6EFD", marginBottom: 4 }}>
                  ₹{rental.rent.toLocaleString("en-IN")}<span style={{ fontSize: "1rem", color: "#6c757d" }}>/month</span>
                </div>
                <div style={{ color: "#6c757d", fontSize: "1rem" }}>
                  📍 {rental.college_distance_km ?? rental.distance_km} km from college
                </div>
              </div>
              {details.overall_score != null && (
                <div style={{ textAlign: "center", background: "linear-gradient(135deg, #0D6EFD 0%, #0a58ca 100%)", color: "white", padding: "16px 24px", borderRadius: "12px", minWidth: "120px" }}>
                  <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Overall Score</div>
                  <div style={{ fontSize: "2.5rem", fontWeight: 700 }}>{details.overall_score}</div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>/ 100</div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16, fontSize: "1.05rem", color: "#495057", lineHeight: 1.6 }}>
              {rental.description}
            </div>

            {/* Quick Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#f8f9fa", padding: 12, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#6c757d", marginBottom: 4 }}>Safety Score</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#28a745" }}>{rental.safety_score}</div>
              </div>
              <div style={{ background: "#f8f9fa", padding: 12, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#6c757d", marginBottom: 4 }}>Trust Score</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#17a2b8" }}>{rental.trust_score}</div>
              </div>
              <div style={{ background: "#f8f9fa", padding: 12, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "#6c757d", marginBottom: 4 }}>Campus Fit</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#ffc107" }}>{rental.campus_fit_score}/10</div>
              </div>
            </div>

            {/* Key Info Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: "#e7f3ff", color: "#0D6EFD", padding: "6px 12px", borderRadius: 20, fontSize: "0.85rem", fontWeight: 500 }}>
                💬 Response: {rental.response_time_minutes} min
              </span>
              <span style={{ background: "#fff3cd", color: "#856404", padding: "6px 12px", borderRadius: 20, fontSize: "0.85rem", fontWeight: 500 }}>
                💰 Price: {rental.price_fairness}
              </span>
              <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "6px 12px", borderRadius: 20, fontSize: "0.85rem", fontWeight: 500 }}>
                ✅ Complaints: {rental.complaints_count}
              </span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        {details.score_breakdown && (
          <div className="card" style={{ marginBottom: 24, border: "2px solid #e9ecef" }}>
            <div className="card-body">
              <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, color: "#212529" }}>
                📊 How Your Score Breaks Down
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {/* Budget Fit */}
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#495057", marginBottom: 6 }}>Budget Fit</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, background: "#e9ecef", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ background: "#28a745", height: "100%", width: `${(details.score_breakdown.budget_fit / 30) * 100}%` }}></div>
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#28a745", minWidth: "45px" }}>{details.score_breakdown.budget_fit}/30</div>
                  </div>
                </div>

                {/* Distance Fit */}
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#495057", marginBottom: 6 }}>Distance Fit</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, background: "#e9ecef", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ background: "#17a2b8", height: "100%", width: `${(details.score_breakdown.distance_fit / 30) * 100}%` }}></div>
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#17a2b8", minWidth: "45px" }}>{details.score_breakdown.distance_fit}/30</div>
                  </div>
                </div>

                {/* Safety */}
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#495057", marginBottom: 6 }}>Safety</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, background: "#e9ecef", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ background: "#ffc107", height: "100%", width: `${(details.score_breakdown.safety_contribution / 20) * 100}%` }}></div>
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffc107", minWidth: "45px" }}>{details.score_breakdown.safety_contribution}/20</div>
                  </div>
                </div>

                {/* Trust */}
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#495057", marginBottom: 6 }}>Trust</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, background: "#e9ecef", height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ background: "#dc3545", height: "100%", width: `${(details.score_breakdown.trust_contribution / 20) * 100}%` }}></div>
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#dc3545", minWidth: "45px" }}>{details.score_breakdown.trust_contribution}/20</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Smart Location & Proximity Analysis */}
        {proximity && (
          <div className="card" style={{ marginBottom: 24, border: "2px solid #e7f3ff" }}>
            <div className="card-body">
              <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, color: "#0D6EFD" }}>
                📍 Smart Location & Proximity
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                <div style={{ background: "#f8f9fa", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>Nearest College</div>
                  <div style={{ fontWeight: 700 }}>{proximity.nearby_college}</div>
                  <div style={{ color: "#6c757d" }}>{proximity.college_distance_km} km away</div>
                </div>
                <div style={{ background: "#f8f9fa", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>Nearest Office Hub</div>
                  <div style={{ fontWeight: 700 }}>{proximity.nearby_office_hub}</div>
                  <div style={{ color: "#6c757d" }}>{proximity.office_distance_km} km away</div>
                </div>
                <div style={{ background: "#e7f3ff", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.85rem", color: "#0D6EFD" }}>Estimated Commute</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D6EFD" }}>{proximity.commute_minutes} min</div>
                </div>
                <div style={{ background: "#e8f5e9", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.85rem", color: "#2e7d32" }}>Proximity Score</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2e7d32" }}>{proximity.proximity_score}/100</div>
                </div>
              </div>
              <div style={{ marginTop: 12, color: "#6c757d", fontSize: "0.9rem" }}>
                Best suited for: <strong>{proximity.best_for === "college" ? "College commute" : "Office commute"}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Safety Section */}
        <div className="card" style={{ marginBottom: 24, border: "2px solid #f8d7da" }}>
          <div className="card-body">
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, color: "#721c24" }}>
              🛡️ Locality Safety Details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {/* Police Distance */}
              <div style={{ background: "#fff3cd", padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: "0.85rem", color: "#856404", fontWeight: 600, marginBottom: 6 }}>Police Station Nearby</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#856404" }}>
                  {rental.police_distance_km} <span style={{ fontSize: "0.9rem" }}>km</span>
                </div>
              </div>

              {/* CCTV Coverage */}
              <div style={{ background: "#d1ecf1", padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: "0.85rem", color: "#0c5460", fontWeight: 600, marginBottom: 6 }}>CCTV Coverage</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0c5460" }}>
                  {rental.cctv_coverage}%
                </div>
              </div>

              {/* Street Lighting */}
              <div style={{ background: "#e2e3e5", padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: "0.85rem", color: "#383d41", fontWeight: 600, marginBottom: 6 }}>Street Lighting</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#383d41" }}>
                  {rental.street_lighting}%
                </div>
              </div>

              {/* Public Transport */}
              <div style={{ background: "#d4edda", padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: "0.85rem", color: "#155724", fontWeight: 600, marginBottom: 6 }}>Public Transport</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#155724" }}>
                  {rental.transit_access}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Neighborhood Analytics */}
        {neighborhood && (
          <div className="card" style={{ marginBottom: 24, border: "2px solid #d4edda" }}>
            <div className="card-body">
              <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, color: "#155724" }}>
                🏘️ Safety & Neighborhood Analytics
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                <div style={{ background: "#f8f9fa", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>Neighborhood</div>
                  <div style={{ fontWeight: 700 }}>{neighborhood.neighborhood}</div>
                  <div style={{ color: "#6c757d" }}>{neighborhood.city_zone} Zone</div>
                </div>
                <div style={{ background: "#f8f9fa", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>Women Safety Index</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{neighborhood.women_safety_index}/100</div>
                </div>
                <div style={{ background: "#fff3cd", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.85rem", color: "#856404" }}>Crime Index (lower is better)</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{neighborhood.crime_index}/100</div>
                </div>
                <div style={{ background: "#d1ecf1", padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.85rem", color: "#0c5460" }}>Late Night Transit</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{neighborhood.night_transit_score}/100</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        {metrics && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, color: "#0D6EFD" }}>
                ✅ Why This Owner Is Trusted
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
                {metrics.trust_score.map((item) => (
                  <div key={item} style={{ background: "#e7f3ff", padding: 12, borderRadius: 8, fontSize: "0.95rem", color: "#0c5460" }}>
                    ✓ {item}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, color: "#28a745" }}>
                🏘️ How Safety Is Measured
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {metrics.safety_score.map((item) => (
                  <div key={item} style={{ background: "#d4edda", padding: 12, borderRadius: 8, fontSize: "0.95rem", color: "#155724" }}>
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tenant–Owner Trust Score */}
        {ownerTrust && (
          <div className="card" style={{ marginBottom: 24, border: "2px solid #e7f1ff" }}>
            <div className="card-body">
              <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12, color: "#0D6EFD" }}>
                🤝 Tenant–Owner Trust Score
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{ownerTrust.owner.name}</div>
                  <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>Owner ID: {ownerTrust.owner.owner_id}</div>
                  <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>Avg rating: {ownerTrust.owner.average_rating} ⭐</div>
                </div>
                <div style={{ background: "#e7f3ff", padding: "10px 14px", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: "0.85rem", color: "#0D6EFD" }}>Trust Score</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0D6EFD" }}>{ownerTrust.trust_score}/100</div>
                  <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>{ownerTrust.trust_label}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mess & Tiffin Options */}
        {tiffin && tiffin.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, color: "#212529" }}>
                🍱 Mess & Tiffin Options
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {tiffin.map((option) => (
                  <div key={option.provider} style={{ background: "#f8f9fa", padding: 12, borderRadius: 8 }}>
                    <div style={{ fontWeight: 700 }}>{option.provider}</div>
                    <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>₹{option.price_per_meal} per meal</div>
                    <div style={{ color: "#6c757d", fontSize: "0.85rem" }}>{option.veg_only ? "Veg only" : "Veg/Non-veg"}</div>
                    <div style={{ color: "#ffc107", fontSize: "0.85rem" }}>⭐ {option.rating}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {rental.reviews && rental.reviews.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16, color: "#212529" }}>
                ⭐ Tenant Reviews
              </div>
              {rental.reviews.map((review, idx) => (
                <div key={idx} style={{ 
                  background: "#f8f9fa", 
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 12,
                  borderLeft: review.is_verified ? "4px solid #28a745" : "4px solid #6c757d"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, color: "#495057" }}>{review.tenant_name}</div>
                    <div style={{ color: "#ffc107" }}>{"⭐".repeat(review.rating)}</div>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: 6 }}>{review.comment}</div>
                  {review.is_verified && (
                    <span style={{ fontSize: "0.75rem", background: "#d4edda", color: "#155724", padding: "2px 8px", borderRadius: 3 }}>
                      ✓ Verified Tenant Review
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Expense & Bill Splitting */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12, color: "#212529" }}>
              🧾 Shared Expense & Bill Split
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <input
                className="input"
                type="number"
                placeholder="Total rent"
                value={expenseForm.rent}
                onChange={(e) => setExpenseForm({ ...expenseForm, rent: e.target.value })}
              />
              <input
                className="input"
                type="number"
                placeholder="Utilities"
                value={expenseForm.utilities}
                onChange={(e) => setExpenseForm({ ...expenseForm, utilities: e.target.value })}
              />
              <input
                className="input"
                type="number"
                placeholder="Roommates"
                value={expenseForm.roommates}
                onChange={(e) => setExpenseForm({ ...expenseForm, roommates: e.target.value })}
              />
            </div>
            <button className="button" style={{ marginTop: 12 }} onClick={handleSplitExpenses}>Split Now</button>
            {expenseResult && (
              <div style={{ marginTop: 12, background: "#f8f9fa", padding: 12, borderRadius: 8 }}>
                <div style={{ fontWeight: 700 }}>Per person: ₹{expenseResult.per_person}</div>
                <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                  Total: ₹{expenseResult.total} • Roommates: {expenseResult.roommates}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12, color: "#212529" }}>
              ⭐ Reviews & Ratings
            </div>
            
            {/* Submit Review Form */}
            <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>Share Your Experience</div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: "0.85rem", color: "#6c757d", marginBottom: 4, display: "block" }}>
                  Rating
                </label>
                <select 
                  className="select" 
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  style={{ width: "100%" }}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Below Average</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: "0.85rem", color: "#6c757d", marginBottom: 4, display: "block" }}>
                  Your Review
                </label>
                <textarea
                  className="input"
                  placeholder="Share your experience with this property..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows="3"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>
              <button 
                className="button"
                onClick={() => {
                  if (reviewForm.comment.trim()) {
                    const newReview = {
                      id: Date.now(),
                      rating: reviewForm.rating,
                      comment: reviewForm.comment,
                      author: "You",
                      date: new Date().toLocaleDateString(),
                      verified: true
                    };
                    setReviews([newReview, ...reviews]);
                    setReviewForm({ rating: 5, comment: "" });
                    setSubmitSuccess("Review submitted successfully!");
                    setTimeout(() => setSubmitSuccess(""), 3000);
                  }
                }}
              >
                Submit Review
              </button>
              {submitSuccess && (
                <div style={{ marginTop: 8, padding: 8, background: "#d4edda", color: "#155724", borderRadius: 4, fontSize: "0.85rem" }}>
                  ✓ {submitSuccess}
                </div>
              )}
            </div>

            {/* Display Reviews */}
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 12, color: "#495057" }}>
                Recent Reviews ({reviews.length})
              </div>
              {reviews.length === 0 ? (
                <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8, textAlign: "center", color: "#6c757d" }}>
                  No reviews yet. Be the first to review!
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {reviews.map((review) => (
                    <div key={review.id} style={{ padding: 12, background: "#fff", border: "1px solid #e9ecef", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, color: "#212529" }}>{review.author}</span>
                          {review.verified && (
                            <span style={{ background: "#e7f3ff", color: "#0D6EFD", padding: "2px 8px", borderRadius: 12, fontSize: "0.7rem", fontWeight: 600 }}>
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[...Array(review.rating)].map((_, i) => (
                            <span key={i} style={{ color: "#ffc107" }}>⭐</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#495057", lineHeight: 1.5 }}>
                        {review.comment}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: 6 }}>
                        {review.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Complaints Section */}
        <div className="card" style={{ marginBottom: 24, border: "2px solid #dc3545" }}>
          <div className="card-body">
            <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12, color: "#dc3545" }}>
              🚨 File a Complaint
            </div>
            
            {/* Complaint Form */}
            <div style={{ background: "#fff5f5", padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: "0.85rem", color: "#721c24", marginBottom: 12, padding: 8, background: "#f8d7da", borderRadius: 4 }}>
                <strong>Important:</strong> Use this to report safety issues, fraud, or violations. False complaints may result in account suspension.
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: "0.85rem", color: "#495057", marginBottom: 4, display: "block", fontWeight: 600 }}>
                  Subject *
                </label>
                <select 
                  className="select" 
                  value={complaintForm.subject}
                  onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                  style={{ width: "100%" }}
                >
                  <option value="">Select complaint type</option>
                  <option value="safety">Safety Concern</option>
                  <option value="fraud">Fraud/Scam</option>
                  <option value="property">Property Condition Issue</option>
                  <option value="owner">Owner Misconduct</option>
                  <option value="false_listing">False/Misleading Listing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: "0.85rem", color: "#495057", marginBottom: 4, display: "block", fontWeight: 600 }}>
                  Detailed Description *
                </label>
                <textarea
                  className="input"
                  placeholder="Provide detailed information about your complaint..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  rows="4"
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              {/* Anonymous Option */}
              <div style={{ marginBottom: 16, padding: 12, background: "#e7f3ff", borderRadius: 8, border: "1px solid #b8d4f1" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={complaintForm.anonymous}
                    onChange={(e) => setComplaintForm({ ...complaintForm, anonymous: e.target.checked })}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0D6EFD" }}>
                    🕵️ Submit Anonymously
                  </span>
                </label>
                <div style={{ fontSize: "0.75rem", color: "#495057", marginTop: 4, marginLeft: 26 }}>
                  Your identity will be protected. Only admins can see anonymous complaints.
                </div>
              </div>

              <button 
                className="button"
                style={{ background: "#dc3545", color: "white" }}
                onClick={() => {
                  if (complaintForm.subject && complaintForm.description.trim()) {
                    const newComplaint = {
                      id: Date.now(),
                      subject: complaintForm.subject,
                      description: complaintForm.description,
                      anonymous: complaintForm.anonymous,
                      author: complaintForm.anonymous ? "Anonymous" : "You",
                      date: new Date().toLocaleDateString(),
                      status: "Submitted"
                    };
                    setComplaints([newComplaint, ...complaints]);
                    setComplaintForm({ subject: "", description: "", anonymous: false });
                    setSubmitSuccess("Complaint submitted successfully. We'll review it within 24 hours.");
                    setTimeout(() => setSubmitSuccess(""), 5000);
                  } else {
                    alert("Please fill in all required fields");
                  }
                }}
              >
                Submit Complaint
              </button>
            </div>

            {/* Display Complaints */}
            {complaints.length > 0 && (
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 12, color: "#495057" }}>
                  Your Complaints ({complaints.length})
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {complaints.map((complaint) => (
                    <div key={complaint.id} style={{ padding: 12, background: "#fff", border: "1px solid #dc3545", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, color: "#212529" }}>
                            {complaint.anonymous ? "🕵️ Anonymous" : complaint.author}
                          </span>
                          <span style={{ background: "#fff3cd", color: "#856404", padding: "2px 8px", borderRadius: 12, fontSize: "0.7rem", fontWeight: 600 }}>
                            {complaint.status}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#6c757d" }}>{complaint.date}</span>
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#dc3545", marginBottom: 4 }}>
                        {complaint.subject.charAt(0).toUpperCase() + complaint.subject.slice(1).replace("_", " ")}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#495057", lineHeight: 1.5 }}>
                        {complaint.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
          <button 
            onClick={() => setShowAgreement(true)}
            style={{ 
              background: "#17a2b8",
              color: "white", 
              border: "none", 
              padding: "12px 24px", 
              fontSize: "1rem", 
              fontWeight: 600,
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            📄 Generate Agreement
          </button>
          <button 
            onClick={() => setShowPayment(true)}
            style={{ 
              background: "#ffc107",
              color: "#212529", 
              border: "none", 
              padding: "12px 24px", 
              fontSize: "1rem", 
              fontWeight: 600,
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            💳 Payment Options
          </button>
          <button 
            onClick={() => setShowContactOwner(true)}
            style={{ 
              background: "linear-gradient(135deg, #0D6EFD 0%, #0a58ca 100%)",
              color: "white", 
              border: "none", 
              padding: "12px 24px", 
              fontSize: "1rem", 
              fontWeight: 600,
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(13, 110, 253, 0.3)"
            }}>
            📞 Contact Owner
          </button>
        </div>

        {/* Agreement Modal */}
        {showAgreement && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }} onClick={() => setShowAgreement(false)}>
            <div style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              maxWidth: 600,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto"
            }} onClick={(e) => e.stopPropagation()}>
              <h3>Digital Rental Agreement</h3>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <input
                  className="input"
                  placeholder="Tenant name"
                  value={agreementTenant}
                  onChange={(e) => setAgreementTenant(e.target.value)}
                />
                <input
                  className="input"
                  type="date"
                  value={agreementStart}
                  onChange={(e) => setAgreementStart(e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Deposit amount"
                  value={agreementDeposit}
                  onChange={(e) => setAgreementDeposit(Number(e.target.value))}
                />
                <button className="button" onClick={handleGenerateAgreement} disabled={agreementLoading}>
                  {agreementLoading ? "Generating..." : "Generate Agreement"}
                </button>
              </div>
              <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, fontSize: "0.9rem", marginTop: 12, whiteSpace: "pre-wrap" }}>
                {agreementText || "Generate a draft agreement to preview here."}
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button
                  className="button"
                  onClick={handleDownloadAgreement}
                  disabled={!agreementText}
                >
                  Download Draft
                </button>
                <button
                  onClick={() => setShowAgreement(false)}
                  className="button button-ghost"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPayment && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }} onClick={() => setShowPayment(false)}>
            <div style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              maxWidth: 500,
              width: "90%"
            }} onClick={(e) => e.stopPropagation()}>
              <h3>Digital Rent Payment</h3>
              <p style={{ fontSize: "0.9rem", color: "#6c757d", marginTop: 8 }}>
                Choose a method and simulate a secure payment flow.
              </p>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <select className="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {(rental.payment_methods || []).map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                <input
                  className="input"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                />
                <button className="button" onClick={handleInitiatePayment}>
                  Pay Now
                </button>
              </div>
              {paymentStatus.status !== "idle" && (
                <div style={{ background: "#e7f3ff", padding: 12, borderRadius: 8, marginTop: 12, fontSize: "0.9rem" }}>
                  Status: <strong>{paymentStatus.status}</strong>
                  {paymentStatus.transactionId && (
                    <div style={{ color: "#6c757d" }}>Transaction: {paymentStatus.transactionId}</div>
                  )}
                </div>
              )}
              <div style={{ background: "#fff3cd", padding: 12, borderRadius: 8, fontSize: "0.85rem", marginTop: 16 }}>
                <strong>Note:</strong> This is a demo. No real payment gateway is integrated.
              </div>
              <button
                onClick={() => setShowPayment(false)}
                className="button button-ghost"
                style={{ width: "100%", marginTop: 16 }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Contact Owner Modal */}
        {showContactOwner && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }} onClick={() => setShowContactOwner(false)}>
            <div style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              maxWidth: 500,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto"
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 16, color: "#212529", display: "flex", alignItems: "center", gap: 8 }}>
                👤 Owner Contact Information
              </div>

              {ownerDetails ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {/* Owner Name */}
                  <div style={{ padding: 12, background: "#f8f9fa", borderRadius: 8, borderLeft: "4px solid #0D6EFD" }}>
                    <div style={{ fontSize: "0.75rem", color: "#6c757d", fontWeight: 600, marginBottom: 4 }}>
                      👤 Owner Name
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#212529" }}>
                      {ownerDetails?.name || "Not provided"}
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ padding: 12, background: "#f8f9fa", borderRadius: 8, borderLeft: "4px solid #198754" }}>
                    <div style={{ fontSize: "0.75rem", color: "#6c757d", fontWeight: 600, marginBottom: 4 }}>
                      📧 Email Address
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#212529" }}>
                      {ownerDetails?.email || "Not provided"}
                    </div>
                    {ownerDetails?.email && (
                      <a 
                        href={`mailto:${ownerDetails?.email}`}
                        style={{
                          display: "inline-block",
                          marginTop: 8,
                          padding: "6px 12px",
                          background: "#198754",
                          color: "white",
                          borderRadius: 6,
                          textDecoration: "none",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        ✉️ Send Email
                      </a>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div style={{ padding: 12, background: "#f8f9fa", borderRadius: 8, borderLeft: "4px solid #fd7e14" }}>
                    <div style={{ fontSize: "0.75rem", color: "#6c757d", fontWeight: 600, marginBottom: 4 }}>
                      📱 Mobile Number
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#212529" }}>
                      {ownerDetails?.phone || "Not provided"}
                    </div>
                    {ownerDetails?.phone && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <a 
                          href={`tel:${ownerDetails?.phone}`}
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            background: "#fd7e14",
                            color: "white",
                            borderRadius: 6,
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          ☎️ Call Owner
                        </a>
                        <a 
                          href={`sms:${ownerDetails?.phone}`}
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            background: "#0D6EFD",
                            color: "white",
                            borderRadius: 6,
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          💬 Send SMS
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div style={{ padding: 12, background: "#f8f9fa", borderRadius: 8, borderLeft: "4px solid #dc3545" }}>
                    <div style={{ fontSize: "0.75rem", color: "#6c757d", fontWeight: 600, marginBottom: 4 }}>
                      📍 City/Location
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#212529" }}>
                      {ownerDetails?.city || details.property?.city || "Not provided"}
                    </div>
                  </div>

                  {/* WhatsApp Option */}
                  {ownerDetails?.phone && (
                    <div style={{ padding: 16, background: "linear-gradient(135deg, #25D366 0%, #1eaa4e 100%)", borderRadius: 8, textAlign: "center" }}>
                      <a 
                        href={`https://wa.me/${ownerDetails?.phone}?text=Hi, I'm interested in your property listing. Can we discuss about it?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          padding: "12px 24px",
                          background: "white",
                          color: "#25D366",
                          borderRadius: 8,
                          textDecoration: "none",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "scale(1.05)";
                          e.target.style.boxShadow = "0 4px 12px rgba(37, 211, 102, 0.3)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "scale(1)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        💬 Message on WhatsApp
                      </a>
                      <div style={{ color: "white", fontSize: "0.75rem", marginTop: 8 }}>
                        Direct message to discuss about this property
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div style={{ padding: 12, background: "#e7f3ff", borderRadius: 8, fontSize: "0.85rem", color: "#0c5460", borderLeft: "4px solid #0D6EFD" }}>
                    <strong>💡 Tip:</strong> Contact the owner directly to discuss availability, additional details, site visits, and negotiate terms.
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: "center", color: "#6c757d" }}>
                  Owner information not available
                </div>
              )}

              <button
                onClick={() => setShowContactOwner(false)}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "10px 16px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
