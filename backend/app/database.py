from pymongo import MongoClient
import os

#DB_USER = os.getenv("DB_USER")
#DB_PASSWORD = os.getenv("DB_PASSWORD")
#MONGO_URI = f"mongodb://{DB_USER}:{DB_PASSWORD}@localhost:27017/{DB_NAME}"

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "credenciais_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
creds_collection = db["credentials"]