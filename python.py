# backend/app/database.py
from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "credenciais_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
creds_collection = db["credentials"]

# backend/app/auth.py
from passlib.context import CryptContext
import jwt
import datetime
import os

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(username: str):
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    payload = {"sub": username, "exp": expiration}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# backend/app/models.py
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Credential(BaseModel):
    site: str
    username: str
    password: str

# backend/app/routes/users.py
from fastapi import APIRouter, HTTPException
from app.models import UserCreate, UserLogin
from app.database import users_collection
from app.auth import hash_password, verify_password, create_token

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Usuário já existe")
    hashed_pw = hash_password(user.password)
    users_collection.insert_one({"username": user.username, "password": hashed_pw})
    return {"message": "Usuário registrado com sucesso!"}

@router.post("/login")
def login(user: UserLogin):
    user_data = users_collection.find_one({"username": user.username})
    if not user_data or not verify_password(user.password, user_data["password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = create_token(user.username)
    return {"token": token}

# backend/app/routes/credentials.py
from fastapi import APIRouter
from app.models import Credential
from app.database import creds_collection

router = APIRouter()

@router.post("/add-credential")
def add_credential(cred: Credential):
    creds_collection.insert_one(cred.dict())
    return {"message": "Credencial salva com sucesso!"}

# backend/app/main.py
from fastapi import FastAPI
from app.routes import users, credentials

app = FastAPI()

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(credentials.router, prefix="/credentials", tags=["Credentials"])
