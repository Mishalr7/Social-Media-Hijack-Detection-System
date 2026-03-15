import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from dotenv import load_dotenv

# Load env variables first
load_dotenv()

from database import login_logs_collection, alerts_collection
from auth import auth_blueprint
from middleware import require_auth
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)

# Fix real IP behind load balancers (Vercel, Render, Heroku)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Secure CORS for frontend
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5174')
CORS(app, resources={r"/api/*": {"origins": frontend_url}})

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'fallback-secret-key-change-it')
jwt = JWTManager(app)

# Rate Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Protect endpoints
@app.route('/api/logs', methods=['GET'])
@require_auth
def get_logs():
    current_user = get_jwt_identity()

    # Fetch logs
    logs = list(login_logs_collection.find({"email": current_user}).sort("timestamp", -1).limit(20))
    # Convert ObjectIDs to strings so they are JSON serializable
    for log in logs:
        log["_id"] = str(log["_id"])
    return jsonify(logs), 200

@app.route('/api/alerts', methods=['GET'])
@require_auth
def get_alerts():
    current_user = get_jwt_identity()

    # Fetch alerts
    alerts = list(alerts_collection.find({"email": current_user}).sort("timestamp", -1).limit(20))
    for alert in alerts:
        alert["_id"] = str(alert["_id"])
    return jsonify(alerts), 200

# Apply rate-limiting to auth_blueprint routes individually or register blueprint without breaking
limiter.limit("5 per minute")(auth_blueprint)
app.register_blueprint(auth_blueprint, url_prefix='/api')


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
