import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api.js";

export default function TrustSafetyPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/trust-metrics`)
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch(() => setMetrics(null));
  }, []);

  return (
    <main className="page">
      <div className="container">
        <div style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 8 }}>Trust & Safety</div>
        <div style={{ color: "#6c757d", marginBottom: 16 }}>Clear, explainable scoring for students.</div>

        {!metrics ? (
          <div>Unable to load metrics.</div>
        ) : (
          <div className="grid">
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Trust score factors</div>
                <ul style={{ paddingLeft: 18, color: "#495057" }}>
                  {metrics.trust_score.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Safety score factors</div>
                <ul style={{ paddingLeft: 18, color: "#495057" }}>
                  {metrics.safety_score.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
