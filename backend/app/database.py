from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = "credenciais_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
creds_collection = db["credentials"]