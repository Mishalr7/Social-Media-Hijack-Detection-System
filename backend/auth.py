from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import bcrypt
import re
from flask_jwt_extended import create_access_token, get_jwt_identity
from database import users_collection, login_logs_collection, alerts_collection
from detection import get_location_from_ip, calculate_risk_score

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"msg": "Missing email or password"}), 400

    email = data['email']
    password = data['password']

    if not email or not password:
        return jsonify({"msg": "Email and password cannot be empty"}), 400

    # Basic input validation for email
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"msg": "Invalid email format"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 409

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user = {
        "email": email,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc)
    }
    
    users_collection.insert_one(user)

    return jsonify({"msg": "User created successfully"}), 201

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"msg": "Missing email or password"}), 400

    email = data['email']
    password = data['password']

    user = users_collection.find_one({"email": email})

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"msg": "The email or password you entered is incorrect. Please try again."}), 401
    
    # Metadata for login detection
    # If testing locally, IP will be 127.0.0.1.
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    # Extract only the first IP if there is a list
    if ip_address:
        ip_address = ip_address.split(',')[0].strip()

    device = request.headers.get('User-Agent')
    location_data = get_location_from_ip(ip_address)
    location = location_data.get('location', 'Unknown')
    lat = location_data.get('lat')
    lon = location_data.get('lon')
    isp = location_data.get('isp', 'Unknown')
    timestamp = datetime.now(timezone.utc)

    # Fetch previous logs for this user to calculate risk score
    previous_logins = list(login_logs_collection.find({"email": email}))
    
    login_data = {
        "email": email,
        "ip_address": ip_address,
        "device": device,
        "location": location,
        "lat": lat,
        "lon": lon,
        "isp": isp,
        "timestamp": timestamp,
    }

    # Calculate risk score
    score, reasons = calculate_risk_score(login_data, previous_logins)
    login_data["risk_score"] = score
    login_data["reasons"] = reasons

    # Store login log
    login_logs_collection.insert_one(login_data)

    # If suspicious, generate alert
    if score >= 60:
        alert = {
            "email": email,
            "ip_address": ip_address,
            "device": device,
            "location": location,
            "timestamp": timestamp,
            "risk_score": score,
            "reasons": reasons,
            "status": "unread"
        }
        alerts_collection.insert_one(alert)

    # Issue JWT token
    access_token = create_access_token(identity=email)

    return jsonify({"token": access_token, "msg": "Login successful"}), 200
