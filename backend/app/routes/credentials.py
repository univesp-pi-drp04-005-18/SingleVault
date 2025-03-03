from fastapi import APIRouter
from models import Credential
from database import creds_collection
from typing import List
from fastapi import HTTPException


router = APIRouter()

@router.post("/add-credential")
def add_credential(cred: Credential):
    # Criptografar ou hash os campos sensíveis antes de salvar no banco
    cred.encrypt_fields()
    
    # Inserir as credenciais criptografadas ou com o hash no banco de dados
    creds_collection.insert_one(cred.dict())
    return {"message": "Credencial salva com sucesso!"}

@router.get("/credentials", response_model=List[Credential])
def get_credentials():
    credentials_cursor = creds_collection.find()
    
    credentials_list = []
    for cred in credentials_cursor:
        cred['_id'] = str(cred['_id'])
        
        # Verificar se o campo 'name' está presente, caso contrário, lançar erro
        if 'name' not in cred:
            raise HTTPException(status_code=400, detail="Campo 'name' é obrigatório")
        
        # Descriptografar os campos sensíveis antes de retornar a resposta
        credential = Credential(**cred)
        credential.decrypt_fields()  # Descriptografar campos sensíveis
        
        credentials_list.append(credential.dict())  # Adicionar os dados à lista

    return credentials_list
