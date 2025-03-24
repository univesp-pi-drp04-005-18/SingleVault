from fastapi import APIRouter, HTTPException, Depends
from models import UserCreate, UserLogin
from database import users_collection
from auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    """Registra um novo usuário no sistema."""
    # Verifica se o usuário já existe
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Usuário já existe")
    
    # Gera um hash da senha antes de salvar
    hashed_pw = hash_password(user.password)
    users_collection.insert_one({"username": user.username, "password": hashed_pw})
    
    # Gera um token JWT após o registro (opcional)
    token = create_token(user.username)
    
    return {"message": "Usuário registrado com sucesso!", "token": token}

@router.post("/login")
def login(user: UserLogin):
    """Realiza o login do usuário e retorna um token JWT."""
    # Verifica se o usuário existe
    user_data = users_collection.find_one({"username": user.username})
    
    # Se não encontrar o usuário ou a senha estiver incorreta, retorna erro
    if not user_data or not verify_password(user.password, user_data["password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    # Gera um token JWT para o usuário autenticado
    token = create_token(user.username)
    
    return {"token": token}

@router.get("/profile")
def get_profile(current_user: str = Depends(get_current_user)):
    """Retorna as informações do perfil do usuário autenticado."""
    user_data = users_collection.find_one({"username": current_user})
    
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Exclui a senha da resposta para não expor informações sensíveis
    user_data.pop("password")
    
    return user_data
