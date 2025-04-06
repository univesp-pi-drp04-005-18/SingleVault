from fastapi import APIRouter, HTTPException, Depends
from models import UserCreate, UserLogin, UserUpdate
from database import users_collection
from auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    """Registra um novo usuário no sistema."""
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Usuário já existe")
    
    hashed_pw = hash_password(user.password)
    users_collection.insert_one({"username": user.username, "password": hashed_pw})
    
    token = create_token(user.username)
    return {"message": "Usuário registrado com sucesso!", "token": token}

@router.post("/login")
def login(user: UserLogin):
    """Realiza o login do usuário e retorna um token JWT."""
    user_data = users_collection.find_one({"username": user.username})
    
    if not user_data or not verify_password(user.password, user_data["password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = create_token(user.username)
    return {"token": token}

@router.get("/profile")
def get_profile(current_user: str = Depends(get_current_user)):
    """Retorna as informações do perfil do usuário autenticado."""
    user_data = users_collection.find_one({"username": current_user})
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user_data.pop("password", None)
    return user_data

@router.put("/update")
def update_user(update: UserUpdate, current_user: str = Depends(get_current_user)):
    """Atualiza o nome de usuário e/ou senha do usuário autenticado."""
    user_data = users_collection.find_one({"username": current_user})
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    update_data = {}

    if update.username:
        if users_collection.find_one({"username": update.username}):
            raise HTTPException(status_code=400, detail="Novo nome de usuário já está em uso")
        update_data["username"] = update.username

    if update.password:
        update_data["password"] = hash_password(update.password)

    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhuma alteração fornecida")

    users_collection.update_one({"username": current_user}, {"$set": update_data})
    return {"message": "Usuário atualizado com sucesso"}

@router.delete("/delete")
def delete_user(current_user: str = Depends(get_current_user)):
    """Remove o usuário autenticado do sistema."""
    result = users_collection.delete_one({"username": current_user})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"message": "Usuário removido com sucesso"}
