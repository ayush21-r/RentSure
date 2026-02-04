# RentSure - Student Rental Platform

## 🌐 Live Website
### ➡️ **[Visit RentSure Now](https://hacksmithrentsure1.netlify.app/)**

---

## 📋 Project Overview

**RentSure** is a full-stack web application designed to help students find safe, affordable rental accommodations near colleges and offices. The platform features intelligent rental recommendations, trust scoring for property owners, and safety metrics to ensure students find reliable housing.

### Key Features
- **Role-Based Authentication**: Separate login for Tenants (students) and Owners (landlords)
- **Smart Rental Recommendations**: AI-powered matching based on budget, distance, and safety
- **Trust & Safety Scoring**: Calculates trust scores for owners based on behavior
- **Property Management Dashboard**: Owners can list, manage, and edit properties
- **Photo Gallery**: Tenants can view multiple property photos
- **Reviews & Complaints**: Anonymous feedback system for accountability
- **Proximity Features**: Find properties near colleges, offices, tiffin services
- **Contact Landlord**: In-app messaging and WhatsApp integration

---

## 🛠️ Technology Stack

### **Backend**
| Technology | Purpose |
|-----------|---------|
| **Python 3.13** | Server-side language |
| **FastAPI** | REST API framework (async, modern) |
| **Uvicorn** | ASGI server (serves FastAPI) |
| **SQLAlchemy** | ORM for database operations |
| **SQLite** | Lightweight relational database |
| **python-jose** | JWT token creation & verification |
| **passlib[pbkdf2_sha256]** | Secure password hashing |
| **Pydantic** | Data validation & serialization |
| **python-multipart** | File upload handling (forms) |

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| **JavaScript (ES6+)** | Client-side language |
| **React 18** | UI framework (component-based) |
| **Vite** | Fast build tool & dev server |
| **React Router** | Client-side routing (SPA) |
| **CSS3** | Styling & responsive design |

### **Database**
- **SQLite** (`rentsure.db`): File-based relational database
  - Simple, no server needed
  - Perfect for student projects & prototypes
  - Can be deployed anywhere

---

## 📁 Project Structure

```
RentSure/
├── Backend (Python)
│   ├── app.py                    # Main FastAPI application & core endpoints
│   ├── models.py                 # SQLAlchemy database models (User, Tenant, Owner, Property)
│   ├── auth_routes.py            # Login/signup endpoints + owner property routes
│   ├── auth_utils.py             # JWT token & password hashing utilities
│   ├── schemas.py                # Pydantic request/response data models
│   ├── trust_score.py            # Trust score calculation algorithm
│   ├── rental_recommender.py     # Property ranking & recommendation engine
│   ├── requirements.txt           # Python dependency list
│   └── rentsure.db               # SQLite database file (auto-created)
│
├── Frontend (React)
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx            # Main app routing & layout
│       │   ├── main.jsx           # React entry point
│       │   ├── api.js             # Centralized API client & utilities
│       │   ├── styles.css         # Global CSS styles
│       │   ├── pages/
│       │   │   ├── LoginPage.jsx           # Login form (both roles)
│       │   │   ├── TenantSignupPage.jsx    # Tenant registration
│       │   │   ├── OwnerSignupPage.jsx     # Owner registration
│       │   │   ├── LandingPage.jsx         # Home page with city selection
│       │   │   ├── ListingsPage.jsx        # Search & filter properties
│       │   │   ├── RentalDetailsPage.jsx   # Property details, reviews, contact
│       │   │   ├── TrustSafetyPage.jsx     # Trust metrics visualization
│       │   │   ├── HelpPage.jsx            # FAQ & help info
│       │   │   └── OwnerDashboard.jsx      # Owner property management
│       │   ├── components/
│       │   │   ├── TopNav.jsx      # Navigation bar
│       │   │   ├── Footer.jsx       # Footer
│       │   │   └── ProtectedRoute.jsx  # Auth guard for routes
│       │   └── context/
│       │       └── AuthContext.jsx  # Global auth state management
│       ├── package.json            # Frontend dependencies
│       ├── vite.config.js          # Vite build configuration
│       └── index.html              # HTML entry point
│
└── Documentation
    ├── README.md                 # This file
    ├── requirements.txt          # Dependency list
    ├── start.bat                 # Windows startup script
    └── QUICK_START.md            # Quick setup guide
```

---

## 🗄️ Database Models (SQLAlchemy)

### **1. User Model**
```
Table: users
├── id (Integer, Primary Key)
├── role (Enum: "tenant" or "owner")
├── name (String)
├── email (String, Unique)
├── phone (String)
├── city (String)
├── password_hash (String) - bcrypt/pbkdf2 hashed
├── created_at (DateTime)
└── Relationships:
    ├── tenant (1:1 to Tenant)
    ├── owner (1:1 to Owner)
    └── properties (1:Many to Property)
```

**Purpose**: Core user account data. Stores login credentials and profile info for both tenants and owners.

### **2. Tenant Model**
```
Table: tenants
├── id (Integer, Primary Key)
├── user_id (Integer, Foreign Key → users.id)
├── student_or_working (String) - "student" or "working"
├── budget_preference (Integer) - in rupees
├── gender_preference (String) - "male", "female", or "any"
└── Relationships:
    └── user (1:1 to User)
```

**Purpose**: Extends User with tenant-specific preferences for matching algorithm.

### **3. Owner Model**
```
Table: owners
├── id (Integer, Primary Key)
├── user_id (Integer, Foreign Key → users.id)
├── property_type (String) - "residential", "commercial", etc.
└── Relationships:
    └── user (1:1 to User)
```

**Purpose**: Extends User with owner-specific info. Links to properties they manage.

### **4. Property Model**
```
Table: properties
├── id (Integer, Primary Key)
├── owner_id (Integer, Foreign Key → users.id)
├── title (String)
├── description (String)
├── city (String)
├── rent (Integer) - monthly rent in rupees
├── availability (Boolean)
├── safety_score (Float, default=4.0)
├── trust_score (Float, default=4.0)
├── nearby_college (String)
├── college_distance_km (Float)
├── nearby_office_hub (String)
├── office_distance_km (Float)
├── women_safety_index (Float)
├── created_at (DateTime)
└── Relationships:
    └── owner (Many:1 to User)
```

**Purpose**: Stores rental property listings. Each property belongs to one owner.

---

## 🔐 Authentication & JWT

### **JWT (JSON Web Tokens)**
- **Library**: `python-jose` (industry standard for Python)
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: `"rentsure-secret-key-dev-only-change-in-production"`
- **Expiry**: 6 hours per token

### **Password Hashing**
- **Library**: `passlib[pbkdf2_sha256]`
- **Scheme**: PBKDF2-SHA256 (100,000 iterations)
- **Salt**: Automatically generated per password

### **Authentication Flow**

```
1. User sends: POST /auth/register/tenant
   - Request: { name, email, phone, city, password, ... }
   - Response: { access_token, user: {id, role, name, email} }

2. Server:
   - Hashes password with passlib
   - Creates User + Tenant record in DB
   - Generates JWT token with { user_id, role, exp }
   - Returns token to client

3. Client stores token in localStorage

4. For protected requests:
   - Client sends: Authorization: Bearer <token>
   - Server verifies token with secret key
   - Extracts user_id & role
   - Grants/denies access
```

---

## 🔌 API Endpoints

### **Authentication Routes** (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/auth/register/tenant` | Register new tenant | ❌ No |
| POST | `/auth/register/owner` | Register new owner | ❌ No |
| POST | `/auth/login` | Login (tenant or owner) | ❌ No |
| GET | `/auth/me` | Get current user info | ✅ Yes |

**Example: Register Tenant**
```bash
POST /auth/register/tenant
Content-Type: application/json

{
  "name": "Priya Singh",
  "email": "priya@example.com",
  "phone": "9876543210",
  "city": "nagpur",
  "password": "SecurePass@123",
  "student_or_working": "student",
  "budget_preference": 10000,
  "gender_preference": "female"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "role": "tenant",
    "name": "Priya Singh",
    "email": "priya@example.com"
  }
}
```

---

### **Search & Recommendation Routes**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?city=nagpur&query=2bhk` | Search properties by city & keyword |
| GET | `/recommendations?city=nagpur&top_n=5` | Get top 5 recommended properties |
| GET | `/cities` | Get list of all cities with properties |
| GET | `/rental/{property_id}` | Get detailed property info |
| GET | `/trust-metrics` | Get trust scoring metrics |
| GET | `/proximity/{property_id}` | Get nearby colleges/offices |

---

### **Owner Routes** (`/owner`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/owner/properties` | Create new property | ✅ Owner |
| GET | `/owner/properties` | List owner's properties | ✅ Owner |
| GET | `/owner/properties/{id}` | Get property details | ✅ Owner |
| PUT | `/owner/properties/{id}` | Update property info | ✅ Owner |
| DELETE | `/owner/properties/{id}` | Delete property | ✅ Owner |
| PUT | `/owner/properties/{id}/availability` | Toggle availability | ✅ Owner |
| GET | `/owner/{owner_id}` | Get owner contact info | ❌ No |

**Example: Create Property (Owner)**
```bash
POST /owner/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "2BHK Apartment in Viman Nagar",
  "description": "Spacious, modern, with balcony",
  "city": "pune",
  "rent": 15000,
  "nearby_college": "PCCOE",
  "college_distance_km": 2.5,
  "image_url": "https://example.com/property.jpg"
}
```

---

## 🧮 Key Algorithms

### **1. Trust Score Calculation** (`trust_score.py`)

The `calculate_trust_score()` function evaluates owner trustworthiness:

```python
def calculate_trust_score(
    average_rating: float,      # Owner rating (1.0 - 5.0)
    response_time_minutes: int, # How fast owner replies
    complaints_count: int,      # Number of complaints
    agreement_completed: bool   # Contract signed?
) -> tuple[int, str]:
    """Returns (score: 0-100, label: "High/Medium/Low Trust")"""
```

**Scoring Breakdown:**
```
Baseline Score: 50

+ Rating Component (0-30 points)
  → 1.0 rating = 0 pts, 5.0 rating = 30 pts
  → Formula: (rating - 1) / 4 * 30

+ Response Time (0-15 points)
  → Faster response = higher trust
  → 24 hours max = full 15 pts, >24hrs = 0 pts
  → Formula: (1 - time/1440) * 15

+ Complaints Penalty (0 to -30 points)
  → -5 points per complaint
  → Example: 3 complaints = -15 points

+ Agreement Bonus (0-10 points)
  → +10 if contract signed, else 0

Final Range: 0 - 100
Labels:
  70-100 → "High Trust" ✅
  40-70  → "Medium Trust" ⚠️
  <40    → "Low Trust" ❌
```

**Example Calculation:**
```
Owner: Rajesh Patel
- Rating: 4.5/5.0 → +22.5 pts
- Response: 60 mins → +14.1 pts
- Complaints: 1 → -5 pts
- Agreement: Yes → +10 pts

Score = 50 + 22.5 + 14.1 - 5 + 10 = 91.6 ≈ 92
Label: "High Trust" ✅
```

---

### **2. Rental Recommendation Engine** (`rental_recommender.py`)

The `recommend_rentals()` function ranks properties using multi-factor scoring:

```python
def recommend_rentals(
    student_profile: StudentProfile,
    properties: List[RentalProperty],
    top_n: int = 5
) -> List[RecommendationResult]:
    """Ranks properties and returns top N recommendations"""
```

**Scoring Factors:**

| Factor | Weight | Formula |
|--------|--------|---------|
| **Budget Fit** | 35% | `(max_budget - rent) / max_budget * 100` |
| **Distance Fit** | 25% | `100 - (distance_km / preferred_distance * 100)` |
| **Safety Score** | 20% | Property safety rating (0-100) |
| **Trust Score** | 20% | Owner trust score (0-100) |

**Calculation:**
```
Overall_Score = (Budget_Fit × 0.35) + (Distance_Fit × 0.25) 
                + (Safety_Score × 0.20) + (Trust_Score × 0.20)
```

**Example:**
```
Student: Max Budget ₹12,000, Preferred Distance 2km

Property A:
- Rent: ₹10,000 → Budget Fit = 83%
- Distance: 1.5km → Distance Fit = 92%
- Safety: 85/100 → 85%
- Trust: 90/100 → 90%

Overall = (83×0.35) + (92×0.25) + (85×0.20) + (90×0.20)
        = 29.05 + 23 + 17 + 18
        = 87.05 (Excellent match!)
```

---

## 🎨 Frontend Components

### **Page Structure**

#### **Public Pages** (No auth required)
1. **LoginPage** (`LoginPage.jsx`)
   - Email/password login form
   - Demo buttons for quick testing
   - Signup links

2. **LandingPage** (`LandingPage.jsx`)
   - City selector
   - Welcome message
   - Quick search

3. **TenantSignupPage** / **OwnerSignupPage**
   - Multi-field registration forms
   - Form validation
   - Password requirements

#### **Protected Pages** (Auth required)

4. **ListingsPage** (`ListingsPage.jsx`)
   - Search & filter properties
   - Display property cards
   - Sort by rating, distance, price

5. **RentalDetailsPage** (`RentalDetailsPage.jsx`)
   - Full property info + photos
   - Owner contact modal
   - Reviews & complaints section
   - Agreement & payment modals

6. **OwnerDashboard** (`OwnerDashboard.jsx`)
   - View owned properties
   - Edit/delete properties
   - Manage photos
   - View details modal

7. **TrustSafetyPage** (`TrustSafetyPage.jsx`)
   - Trust metrics & scoring
   - Safety information

---

### **Core Components**

#### **TopNav.jsx**
- Navigation bar visible on all pages
- Login/logout buttons
- User profile dropdown
- Mobile-responsive menu

#### **ProtectedRoute.jsx**
- Route guard component
- Checks user auth status
- Verifies role permissions
- Redirects to login if unauthorized

#### **AuthContext.jsx** (State Management)
```javascript
// Global auth state (React Context)
const AuthContext = {
  user: { id, role, name, email },
  isAuthenticated: boolean,
  loading: boolean,
  error: string,
  login: async (email, password) => {},
  register: async (data) => {},
  logout: () => {},
}
```

Stores authentication state globally so all components can access it.

---

### **API Helper Functions** (`api.js`)

```javascript
export const API_BASE_URL = "http://localhost:8000";

export async function fetchWithRetry(url, options, retries = 3) {
  // Auto-retry failed requests
}

export function cacheResponse(key, data) {
  // Store API responses in localStorage
}
```

---

## 🚀 How to Run the App

### **Prerequisites**
- **Python 3.13+** installed
- **Node.js 16+** installed
- **npm** package manager

### **1. Backend Setup**

```bash
# Navigate to project root
cd C:/Project/RentSure

# Create virtual environment (already exists, but here's how)
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend on port 8000
uvicorn app:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
✓ Demo tenant created: tenant@rentsure.demo / Tenant@123
✓ Demo owner created: owner@rentsure.demo / Owner@123
```

### **2. Frontend Setup**

```bash
# Open new terminal
cd C:/Project/RentSure/frontend

# Install dependencies
npm install

# Run dev server on port 5173
npm run dev
```

**Expected Output:**
```
  VITE v5.4.21  ready in 381 ms

  ➜  Local:   http://localhost:5173/
```

### **3. Access the App**

Open browser and go to: **http://localhost:5173**

---

## 🧪 Demo Credentials

### **Tenant Account**
- **Email**: `tenant@rentsure.demo`
- **Password**: `Tenant@123`
- **Role**: Tenant (can search & view properties)

### **Owner Account**
- **Email**: `owner@rentsure.demo`
- **Password**: `Owner@123`
- **Role**: Owner (can manage properties)

---

## 🔄 How Data Flows

```
Frontend (React) ←→ Backend (FastAPI) ←→ Database (SQLite)

1. USER ACTION
   └─ User clicks "Login" on LoginPage.jsx

2. FRONTEND
   └─ Calls: fetch('http://localhost:8000/auth/login', {...})

3. BACKEND
   ├─ Receives POST /auth/login
   ├─ Queries database: SELECT * FROM users WHERE email=?
   ├─ Verifies password with passlib
   ├─ Creates JWT token (if valid)
   └─ Returns { access_token, user }

4. FRONTEND
   ├─ Stores token in localStorage
   ├─ Updates AuthContext state
   └─ Redirects to dashboard

5. PROTECTED REQUESTS
   ├─ Frontend sends: Authorization: Bearer <token>
   ├─ Backend verifies token with python-jose
   ├─ Extracts user_id & role
   └─ Processes request if authorized
```

---

## 📊 Typical User Journeys

### **Tenant Journey**
```
1. Signup/Login
   ↓
2. Select City (LandingPage)
   ↓
3. Search Properties (ListingsPage)
   ↓
4. View Details & Contact Owner (RentalDetailsPage)
   ↓
5. Leave Review/Complaint
```

### **Owner Journey**
```
1. Signup/Login
   ↓
2. Create Property (OwnerDashboard)
   ↓
3. Upload Photos & Description
   ↓
4. Toggle Availability
   ↓
5. View Tenant Inquiries/Reviews
```

---

## 🐛 Troubleshooting

### **Backend won't start**
```
Error: ModuleNotFoundError: No module named 'fastapi'
Solution: pip install -r requirements.txt
```

### **Frontend can't connect to backend**
```
Error: Failed to fetch (on login)
Solution: 
1. Check backend is running on port 8000
2. Check CORS is enabled in app.py
3. Check API_BASE_URL in frontend/src/api.js
```

### **Port already in use**
```
# Backend on different port
uvicorn app:app --port 9000

# Frontend on different port
npm run dev -- --port 5174
```

### **Database locked error**
```
Solution: Close other connections and restart backend
rm rentsure.db  # (optional) Delete DB to reset
```

---

## 📝 Key Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| `app.py` | 1,373 | Main API, routes, demo seeding |
| `auth_routes.py` | 377 | Login, signup, owner property endpoints |
| `auth_utils.py` | ~70 | JWT & password functions |
| `models.py` | 102 | Database models (SQLAlchemy) |
| `schemas.py` | ~300 | Request/response validators (Pydantic) |
| `trust_score.py` | 127 | Trust calculation algorithm |
| `rental_recommender.py` | 337 | Recommendation engine |
| `AuthContext.jsx` | ~150 | Global auth state (React) |
| `LoginPage.jsx` | ~160 | Login UI |
| `OwnerDashboard.jsx` | ~500 | Owner property management UI |
| `RentalDetailsPage.jsx` | ~600 | Property details & review UI |

---

## 🎓 Learning Outcomes

By studying this codebase, you'll learn:

✅ **Backend**
- FastAPI REST API design
- SQLAlchemy ORM & database relationships
- JWT authentication & token-based security
- Password hashing best practices (passlib)
- Pydantic data validation
- CORS middleware

✅ **Frontend**
- React hooks & state management
- React Router for SPA navigation
- Context API for global state
- Fetch API & HTTP requests
- Form handling & validation
- Protected routes & auth guards

✅ **Full-Stack**
- Client-server architecture
- Request/response cycles
- Error handling & validation
- Database design & relationships
- Authentication & authorization
- Recommendation algorithms

---

## 📄 License & Notes

- This is a **student project** for learning full-stack development
- Suitable for **final year** computer science / IT students
- Uses **industry-standard** technologies (FastAPI, React, SQLAlchemy)
- Ready for **hackathon** submission or **portfolio** showcase
- Easily **scalable** with AWS/Heroku/Vercel deployment

---

## 🤝 Future Enhancements

- [ ] Email verification on signup
- [ ] Payment integration (Razorpay/Stripe)
- [ ] In-app chat between tenant & owner
- [ ] Map view with property locations
- [ ] Background checks for owners
- [ ] Document verification (ID, Agreement scan)
- [ ] Mobile app (React Native)
- [ ] Admin dashboard for moderation
- [ ] Machine learning for better recommendations
- [ ] Notifications (SMS/Email/Push)

---

## 📞 Support

For issues or questions, refer to:
- Backend errors → Check uvicorn terminal
- Frontend errors → Check browser console (F12)
- Database issues → Check `rentsure.db` file exists
- Auth issues → Verify JWT token in localStorage

---

**Happy coding! 🚀**
