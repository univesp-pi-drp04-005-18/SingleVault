from fastapi import APIRouter, HTTPException, Depends, status, Request
from models import UserCreate, UserLogin, UserUpdate, UserDelete
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

# @router.put("/update")
# def update_user(update: UserUpdate, current_user: str = Depends(get_current_user)):
#     """Atualiza o nome de usuário e/ou senha do usuário autenticado."""
#     user_data = users_collection.find_one({"username": current_user})
#     if not user_data:
#         raise HTTPException(status_code=404, detail="Usuário não encontrado")

#     update_data = {}

#     if update.username:
#         if users_collection.find_one({"username": update.username}):
#             raise HTTPException(status_code=400, detail="Novo nome de usuário já está em uso")
#         update_data["username"] = update.username

#     if update.password:
#         update_data["password"] = hash_password(update.password)

#     if not update_data:
#         raise HTTPException(status_code=400, detail="Nenhuma alteração fornecida")

#     users_collection.update_one({"username": current_user}, {"$set": update_data})
#     return {"message": "Usuário atualizado com sucesso"}

# @router.delete("/delete")
# def delete_user(current_user: str = Depends(get_current_user)):
#     """Remove o usuário autenticado do sistema."""
#     result = users_collection.delete_one({"username": current_user})
#     if result.deleted_count == 0:
#         raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
#     return {"message": "Usuário removido com sucesso"}


@router.put("/update")
async def update_user(
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Atualiza a senha do usuário após verificar a senha atual."""
    try:
        data = await request.json()
        current_password = data.get("current_password")
        new_password = data.get("new_password")
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dados inválidos"
        )
    
    if not current_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual e nova senha são obrigatórias"
        )
    
    user_data = users_collection.find_one({"username": current_user})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Verifica se a senha atual está correta
    if not verify_password(current_password, user_data["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha atual incorreta"
        )
    
    # Atualiza a senha
    users_collection.update_one(
        {"username": current_user},
        {"$set": {"password": hash_password(new_password)}}
    )
    
    return {"success": True, "message": "Senha alterada com sucesso"}

@router.delete("/delete")
async def delete_user(
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Remove o usuário autenticado do sistema após verificar a senha."""
    try:
        data = await request.json()
        password = data.get("password")
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dados inválidos. Forneça a senha no corpo da requisição."
        )
    
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha é obrigatória para deletar a conta"
        )
    
    # Buscar usuário no banco de dados
    user_data = users_collection.find_one({"username": current_user})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Verificar se a senha está correta
    if not verify_password(password, user_data["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha incorreta. A conta não foi deletada."
        )
    
    # Se a senha estiver correta, deletar a conta
    result = users_collection.delete_one({"username": current_user})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return {
        "success": True,
        "message": "Conta deletada com sucesso"
    }