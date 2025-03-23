from fastapi import APIRouter, HTTPException, Depends
from models import Credential
from database import creds_collection
from auth import get_current_user

router = APIRouter()

@router.post("/")
def create_credential(credential: Credential, current_user: str = Depends(get_current_user)):
    """Cria uma credencial associada ao usuário logado."""
    credential.owner = current_user
    credential.encrypt_fields()
    creds_collection.insert_one(credential.dict())
    return {"message": "Credencial salva com sucesso!"}

@router.get("/")
def list_credentials(current_user: str = Depends(get_current_user)):
    """Lista apenas as credenciais do usuário autenticado."""
    credentials = list(creds_collection.find({"owner": current_user}, {"_id": 0}))
    for cred in credentials:
        cred_obj = Credential(**cred)
        cred_obj.decrypt_fields()
        cred.update(cred_obj.dict())
    return credentials

@router.put("/{credential_name}")
def update_credential(credential_name: str, updated_credential: Credential, current_user: str = Depends(get_current_user)):
    """Atualiza uma credencial apenas se pertencer ao usuário autenticado."""
    existing_credential = creds_collection.find_one({"name": credential_name, "owner": current_user})
    if not existing_credential:
        raise HTTPException(status_code=404, detail="Credencial não encontrada ou não autorizada")
    
    updated_credential.owner = current_user
    updated_credential.encrypt_fields()
    creds_collection.update_one({"name": credential_name, "owner": current_user}, {"$set": updated_credential.dict()})
    return {"message": "Credencial atualizada com sucesso!"}

@router.delete("/{credential_name}")
def delete_credential(credential_name: str, current_user: str = Depends(get_current_user)):
    """Deleta uma credencial apenas se pertencer ao usuário autenticado."""
    result = creds_collection.delete_one({"name": credential_name, "owner": current_user})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Credencial não encontrada ou não autorizada")
    return {"message": "Credencial deletada com sucesso!"}
