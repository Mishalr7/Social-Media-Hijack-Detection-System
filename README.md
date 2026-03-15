# Social Media Hijack Detection System

A secure full-stack web application designed to detect suspicious login attempts and possible account hijacking by analyzing login behavior such as IP address, device fingerprint, geolocation, and login patterns.

## Features
- **Frontend**: React.js, Tailwind CSS V4, React Router Dom, Recharts, Axios
- **Backend**: Python, Flask, Flask-JWT-Extended, Flask-Limiter, bcrypt, requests, PyMongo
- **Database**: MongoDB Atlas / Local MongoDB
- **Security Features**: 
  - JWT Authentication
  - Bcrypt Password Hashing
  - API Rate Limiting (Prevent Brute-Force Attacks)
  - Environment Variable Protection (No secrets hardcoded)
  - Input Validation & Injection Prevention
  - Geo-location and device tracking
  - Risk scoring algorithm for suspicious logins

## Project Structure
```
project-root/
│
├── backend/
│   ├── app.py                # Main application entry point
│   ├── auth.py               # Authentication and login routes
│   ├── database.py           # MongoDB connection handler
│   ├── detection.py          # Risk score & IP details algorithm
│   ├── middleware.py         # Custom JWT middleware wrapper
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment Variables
│   └── .env.example          # Template for Environment Variables
│
└── frontend/                 # React Application
    ├── src/
    │   ├── App.jsx           # Master frontend router
    │   ├── components/
    │   │   ├── LoginPage.jsx # Secure User Login/Signup Page
    │   │   └── Dashboard.jsx # Dashboard & Alert Panels 
    └── package.json          # Node.js dependencies
```

## Security Architecture

1. **Environment Variables**: Sensitive data (MongoDB URIs, JWT Tokens) are explicitly stored in local non-version-controlled `.env` files via `python-dotenv`.
2. **Database Security**: Mongo is only accessed backend side. Front-ends know nothing about it. No public write access is supplied. Uses `.env` for strict database authentication.
3. **API Rate Limiting**: Limit login endpoint hitrates to mitigate brute forcing.
4. **JWT Authentication**: Middleware guards `/api/logs` and `/api/alerts` to issue records bound cryptographically to logged-in user tokens.
5. **Robust Password Logging**: We never store plaintext. We hash raw credentials rigorously over the wire using `bcrypt`.
6. **Input Validation**: Clean inputs prevent DB injections.

## Hijack Detection Algorithm

The system assigns a composite risk-score out of 100 based on the following anomalies derived from standard login footprints:
- **Location Irregularity**: Detects logins from unencountered countries and appends `+40` risk points.
- **Unrecognized Devices**: Tracks device User-Agents and appends `+40` risk points on unfamiliar devices.
- **Unusual Login Time**: Inspects anomalies between expected and actual user-operation hours (`+20` risk).
*If Risk Score >= 60, an Alert flag persists alongside the log, surfacing prominently in the user dashboard.*

## Installation

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: 3.9+
- **MongoDB**: Standard MongoDB service / Atlas connection.

### 2. Environment Variables Setup

Create a `.env` inside `backend/`:
```env
MONGO_URI=mongodb://localhost:27017/social_hijack_db  # or MongoDB Atlas URI
JWT_SECRET=super-secret-jwt-key
FLASK_ENV=development
PORT=5000
```

### 3. Running Backend (Flask)

Navigate to `backend/` and execute:
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Unix:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

### 4. Running Frontend (React.js)

Navigate to `frontend/` and execute:
```bash
npm install
npm run dev
```

Visit the displayed local host (usually http://localhost:5173/) to authenticate.
