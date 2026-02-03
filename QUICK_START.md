# RentSure v2.0 - Quick Start Guide

## 🎬 How to Test the Auth System

### Step 1: Start Both Servers (Already Running)
```
✅ Backend: http://localhost:8000 (FastAPI)
✅ Frontend: http://localhost:5175 (Vite React)
```

---

## 👨‍🎓 TENANT FLOW

### 1️⃣ Login Page
**URL**: http://localhost:5175

You see 4 options:
```
┌─────────────────────────────────┐
│     🏠 RentSure                 │
│  Find your perfect rental home  │
├─────────────────────────────────┤
│                                 │
│  Email:        [____________]   │
│  Password:     [____________]   │
│  [Login Button]                 │
│                                 │
│  [👨‍🎓 Tenant Demo] [🏠 Owner Demo] │
│                                 │
│  Don't have account?            │
│  Sign up as Tenant              │
│  Sign up as Owner               │
└─────────────────────────────────┘
```

### 2️⃣ Quick Login as Tenant
**Click**: "👨‍🎓 Tenant Demo" button
- Auto-fills: `tenant@rentsure.demo` / `Tenant@123`
- Calls: `POST /auth/login` → gets JWT token
- Stores: Token in localStorage
- Redirects: `/listings/nagpur`

### 3️⃣ Tenant Listings Page
**URL**: http://localhost:5175/listings/nagpur

See:
```
✨ Find Your Nearest Room
├─ 📚 Select Your College: [VNIT ▼]
├─ 🏢 Select Your Office: [MIHAN ▼]

Gray Filters:
├─ Search Query: [_________]
├─ Rank By: [Best Match ▼]
├─ Max Budget: ₹10,000
└─ Gender Preference: [Any ▼]

Results: 15 rental properties with:
├─ 📍 Property name
├─ ₹ Rent per month
├─ ⭐ Safety score
└─ 📍 Distance to selected college/office
```

### 4️⃣ View Rental Details
**Click**: Any rental card → `/rental/{property_id}`

See detailed info with new sections:
- Smart Location & Proximity
- Safety & Neighborhood Analytics
- Tenant-Owner Trust Score
- Mess & Tiffin Options
- Shared Expense Calculator
- Agreement Generator
- Digital Payment

### 5️⃣ Logout
**Click**: "Logout" in top-right
- Clears token from localStorage
- Redirects: `/login`

---

## 🏠 OWNER FLOW

### 1️⃣ Login Page
**URL**: http://localhost:5175

### 2️⃣ Quick Login as Owner
**Click**: "🏠 Owner Demo" button
- Auto-fills: `owner@rentsure.demo` / `Owner@123`
- Calls: `POST /auth/login` → gets JWT token
- Stores: Token in localStorage
- Redirects: `/owner/dashboard`

### 3️⃣ Owner Dashboard
**URL**: http://localhost:5175/owner/dashboard

See:
```
┌─────────────────────────────────────┐
│ 🏠 Owner Dashboard                  │
│ Welcome, Rajesh Patel!              │
│                    [Logout Button]  │
├─────────────────────────────────────┤
│                                     │
│ [+ Add New Property] [Settings]    │
│                                     │
│ Your Properties (3)                 │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 2BHK Apartment in Viman Nagar   │ │
│ │ ₹15,000/month                    │ │
│ │ City: pune                       │ │
│ │ Safety: 4.5/5                    │ │
│ │ ✓ Available                      │ │
│ │                                  │ │
│ │ [📍 Toggle] [🗑️ Delete]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 1 RK in Baner                    │ │
│ │ ₹8,500/month                     │ │
│ │ ... (same layout)                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Studio in Kothrud                │ │
│ │ ₹11,000/month                    │ │
│ │ ... (same layout)                │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### 4️⃣ Add New Property
**Click**: "+ Add New Property" button

Form opens with fields:
```
┌─────────────────────────────────────┐
│ Property Title [________________]   │
│ Description [________________]       │
│                                     │
│ City: [Pune ▼]  Rent: [10000 ___]  │
│ Safety: [4.0]   Available: [✓]     │
│ Nearby College: [___________]       │
│ Distance: [0 km]                    │
│ Nearby Office: [___________]        │
│ Distance: [0 km]                    │
│                                     │
│ [Create Property]                   │
└─────────────────────────────────────┘
```

**Fill form** → **Click "Create Property"**
- Calls: `POST /owner/properties` (requires JWT)
- Returns: Success message
- Updates: Property list immediately

### 5️⃣ Toggle Availability
**Click**: "📍 Toggle" button on property

- Calls: `PATCH /owner/properties/{id}/availability`
- Updates: Status badge (Available ↔ Unavailable)
- No page reload needed

### 6️⃣ Delete Property
**Click**: "🗑️ Delete" button

- Shows: Confirmation dialog
- Calls: `DELETE /owner/properties/{id}`
- Removes: Property from list immediately
- Shows: Success message

### 7️⃣ Logout
**Click**: "Logout" in top-right
- Clears token
- Redirects: `/login`

---

## 📝 MANUAL SIGNUP FLOWS

### Tenant Signup
**URL**: http://localhost:5175/signup/tenant

Form:
```
Full Name:        [_______________________]
Phone:            [_______________________]
Email:            [_______________________]
City:             [Pune ▼]
Student/Working:  [Student ▼]
Budget (₹):       [10000 ___]
Gender Pref:      [Any ▼]
Password:         [_______________________]
Confirm Pwd:      [_______________________]

[Create Account]
[Already have account? Login here]
```

**Submit** → 
- Validates form
- Calls: `POST /auth/register/tenant`
- Gets JWT token
- Redirects: `/listings/pune`
- Auto-logged in!

### Owner Signup
**URL**: http://localhost:5175/signup/owner

Form:
```
Full Name:        [_______________________]
Phone:            [_______________________]
Email:            [_______________________]
City:             [Pune ▼]
Property Type:    [Residential ▼]
Password:         [_______________________]
Confirm Pwd:      [_______________________]

[Create Account]
[Already have account? Login here]
```

**Submit** →
- Calls: `POST /auth/register/owner`
- Gets JWT token
- Redirects: `/owner/dashboard`
- Auto-logged in!
- No properties yet (empty state shown)

---

## 🔌 API Calls Behind the Scenes

### Login Request
```javascript
POST http://localhost:8000/auth/login
Content-Type: application/json

{
  "email": "tenant@rentsure.demo",
  "password": "Tenant@123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "role": "tenant",
    "name": "Priya Singh",
    "email": "tenant@rentsure.demo"
  }
}
```

### Get Properties (Owner)
```javascript
GET http://localhost:8000/owner/properties
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "properties": [
    {
      "id": 1,
      "title": "2BHK Apartment in Viman Nagar",
      "city": "pune",
      "rent": 15000,
      "availability": true,
      "safety_score": 4.5,
      "created_at": "2025-02-03T10:30:00"
    },
    ...
  ]
}
```

### Create Property
```javascript
POST http://localhost:8000/owner/properties
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "3BHK Villa",
  "description": "Spacious villa with garden",
  "city": "pune",
  "rent": 25000,
  "availability": true,
  "safety_score": 4.8,
  "nearby_college": "COEP",
  "college_distance_km": 2.5
}

Response: { "id": 4, "title": "3BHK Villa", ... }
```

---

## ✅ What to Test

### Security
- [ ] Try accessing `/listings/pune` without login → Redirects to `/login`
- [ ] Try accessing `/owner/dashboard` without login → Redirects to `/login`
- [ ] Login as tenant, try accessing `/owner/dashboard` → Redirects to `/login`
- [ ] Login as owner, try accessing `/listings/pune` → Redirects to `/login`

### Tenant Features
- [ ] Login with demo credentials
- [ ] Select college from dropdown
- [ ] Filter listings by college
- [ ] See distance below each listing
- [ ] Click listing to see details
- [ ] Logout and return to login

### Owner Features
- [ ] Login with demo credentials
- [ ] See 3 demo properties
- [ ] Click "+ Add New Property"
- [ ] Fill form and create property
- [ ] Toggle availability on a property
- [ ] Delete a property
- [ ] Logout and return to login

### Registration
- [ ] Sign up as tenant with new email
- [ ] Auto-login after signup
- [ ] Sign up as owner with new email
- [ ] Auto-login after signup

---

## 🚀 You're All Set!

The RentSure v2.0 auth system is:
- ✅ Fully functional
- ✅ Production-ready patterns
- ✅ Ready to demo to teachers/judges
- ✅ Can add more features anytime

**Enjoy your authentication system!** 🎉
