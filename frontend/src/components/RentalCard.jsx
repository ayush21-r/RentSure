import { Link } from "react-router-dom";

export default function RentalCard({ rental }) {
  const tags = getTags(rental);

  return (
    <div className="card">
      {rental.image_url && (
        <div style={{ width: "100%", height: 180, overflow: "hidden", borderRadius: "8px 8px 0 0", position: "relative" }}>
          <img 
            src={rental.image_url} 
            alt={rental.property_id}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Availability badge overlay */}
          {rental.availability_status && rental.availability_status !== "available" && (
            <div style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: rental.availability_status === "limited" ? "#ff9800" : "#dc3545",
              color: "white",
              padding: "4px 10px",
              borderRadius: 4,
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "capitalize"
            }}>
              {rental.availability_status}
            </div>
          )}
          {/* Direct Owner badge */}
          {rental.is_direct_owner && (
            <div style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "#28a745",
              color: "white",
              padding: "4px 10px",
              borderRadius: 4,
              fontSize: "0.75rem",
              fontWeight: 600
            }}>
              Direct Owner – No Broker
            </div>
          )}
        </div>
      )}
      <div className="card-body">
        <div style={{ fontSize: "0.75rem", color: "#adb5bd", marginBottom: 6 }}>
          {rental.property_id}
        </div>
        <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          ₹{rental.rent.toLocaleString("en-IN")}/month
        </div>
        <div style={{ color: "#6c757d", fontSize: "0.9rem", marginBottom: 8 }}>
          📍 {rental.distance_km} km away
        </div>
        <div style={{ fontSize: "0.9rem", color: "#495057", marginBottom: 10 }}>
          {rental.description}
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: "0.85rem", color: "#495057" }}>
          <div>🛡️ Safety: <strong>{rental.safety_score}</strong></div>
          <div>✅ Trust: <strong>{rental.trust_score}</strong></div>
        </div>
        <div className="meta-row">
          {rental.campus_fit_score != null && (
            <span className="meta-pill">Campus fit {rental.campus_fit_score}/10</span>
          )}
          {rental.price_fairness && (
            <span className="meta-pill">Price: {rental.price_fairness}</span>
          )}
          {rental.availability_status === "available" && (
            <span className="meta-pill" style={{ background: "#d4edda", color: "#155724" }}>✓ Available</span>
          )}
        </div>
        <div className="timeline">
          Response {rental.response_time_minutes ?? "-"} min • Complaints {rental.complaints_count ?? "-"}
        </div>
        {/* Payment methods pills */}
        {rental.payment_methods && rental.payment_methods.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
            {rental.payment_methods.map((method) => (
              <span key={method} style={{
                background: "#e7f3ff",
                color: "#0D6EFD",
                padding: "2px 8px",
                borderRadius: 3,
                fontSize: "0.7rem",
                fontWeight: 500
              }}>
                {method}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {tags.map((tag) => (
            <span key={tag.text} className={`tag ${tag.className || ""}`}>{tag.text}</span>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <Link className="button" to={`/rental/${rental.property_id}`}>
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

function getTags(rental) {
  const tags = [];
  const text = rental.description.toLowerCase();
  if (text.includes("pg")) tags.push({ text: "PG" });
  if (text.includes("hostel")) tags.push({ text: "Hostel" });
  if (text.includes("1bhk")) tags.push({ text: "1BHK" });
  if (rental.trust_score >= 85) tags.push({ text: "Verified", className: "verified" });
  if (rental.distance_km <= 3) tags.push({ text: "Nearby" });
  if (text.includes("metro")) tags.push({ text: "Metro access" });

  if (rental.safety_score >= 90) tags.push({ text: "Women-safe zone" });
  if (rental.cctv_coverage >= 90) tags.push({ text: "CCTV strong" });
  if (rental.street_lighting >= 85) tags.push({ text: "Well-lit" });
  if (rental.transit_access >= 85) tags.push({ text: "Late-night transit" });
  if (rental.police_distance_km != null && rental.police_distance_km <= 1) {
    tags.push({ text: "Police nearby" });
  }

  return tags;
}
