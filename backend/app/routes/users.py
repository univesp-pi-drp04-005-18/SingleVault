from fastapi import APIRouter, HTTPException
from models import UserCreate, UserLogin
from database import users_collection
from auth import hash_password, verify_password, create_token

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