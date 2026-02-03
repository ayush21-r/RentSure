# RentSure — Project Summary

## 1) What the product does
RentSure is a multi‑page student rental product focused on trust, safety, and transparency for cities in India (Nagpur, Pune, Bengaluru). It helps students compare rentals using clear trust/safety metrics and locality signals.

## 2) Pages & user flow
- Landing → select city → browse listings
- Listings → filter verified rentals → open details
- Rental Details → full breakdown of trust, safety, price, and locality
- Trust & Safety → explains metrics
- Help → guidance and support

## 3) Key differentiators (unique features)
- Trust timeline: response time + complaints
- Locality safety snapshot
- Campus proximity score
- Verified‑only filter
- Student‑lens tags (Women‑safe zone, CCTV strong, Well‑lit, Late‑night transit, Police nearby)
- Tier‑2 city focus banner for Nagpur
- Score breakdown (budget + distance + safety + trust)
- Price fairness label

## 4) Backend endpoints (FastAPI)
- GET /cities
- GET /recommendations?city=&top_n=
- GET /rental/{id}
- GET /trust-metrics
- GET /health

## 5) Data model enhancements
Each rental includes:
- campus_fit_score
- police_distance_km
- cctv_coverage
- street_lighting
- transit_access
- price_fairness
- response_time_minutes
- complaints_count
- image_url (thumbnail)

## 6) UI improvements
- Thumbnail image on listing cards
- Hero image on details page
- Score badge + quick stats grid
- Visual progress bars for score breakdown
- Safety detail cards + trust/safety explanation blocks
- CTA button for contact

## 7) Cities and inventory
- Pune: 5 rentals
- Bengaluru: 5 rentals
- Nagpur: 5 rentals

## 8) How to run locally
- Backend: uvicorn app:app --reload
- Frontend: npm run dev (in /frontend)
- Open: http://localhost:5174

## 9) Start file
- start.bat launches backend + frontend in two windows.
