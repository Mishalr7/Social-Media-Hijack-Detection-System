import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client.get_database() # Uses the DB from the URI or default if none given
    # Define collections
    users_collection = db["users"]
    login_logs_collection = db["login_logs"]
    alerts_collection = db["alerts"]
    print("Database connected successfully.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None
    users_collection = None
    login_logs_collection = None
    alerts_collection = None
