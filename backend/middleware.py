from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            # Verify the JWT token is present and valid
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({"msg": "Missing or invalid token"}), 401
        return fn(*args, **kwargs)
    return wrapper
