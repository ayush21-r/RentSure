export default function HelpPage() {
  return (
    <main className="page">
      <div className="container">
        <div style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 8 }}>Help</div>
        <div style={{ color: "#6c757d", marginBottom: 16 }}>Quick guidance for students.</div>
        <div className="grid">
          <div className="card">
            <div className="card-body">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>How to verify a rental</div>
              <div>Check trust score, owner response, and locality safety before booking.</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Report an issue</div>
              <div>Contact RentSure support with property ID and issue details.</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Supported cities</div>
              <div>Nagpur, Pune, Bengaluru.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
