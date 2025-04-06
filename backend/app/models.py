from pydantic import BaseModel, Field
from typing import Optional
import datetime
import jwt
from cryptography.fernet import Fernet
from passlib.context import CryptContext

#SECRET_KEY = os.getenv("SECRET_KEY")
SECRET_KEY = "LAqRl9MnL8XtK6oioLumYLIiI4Ct6C08uLKrH0QFqx0="
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Classe de criação de usuário
class UserCreate(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None

# Classe de login de usuário
class UserLogin(BaseModel):
    username: str
    password: str


class Credential(BaseModel):
    name: str
    owner: str
    site: Optional[str] = None 
    username: Optional[str] = None 
    password: Optional[str] = None
    token: Optional[str] = None
    api_key: Optional[str] = None
    private_key: Optional[str] = None
    public_key: Optional[str] = None
    text: Optional[str] = None 

    def encrypt_string(self, string: str) -> str:
        """
        Criptografa uma string usando Fernet (para senha, chave de API e chave privada).
        """
        cipher = Fernet(SECRET_KEY)
        return cipher.encrypt(string.encode()).decode()

    def decrypt_string(self, string: str) -> str:
        """
        Descriptografa uma string usando Fernet (para senha, chave de API e chave privada).
        """
        cipher = Fernet(SECRET_KEY)
        return cipher.decrypt(string.encode()).decode()

    def encrypt_fields(self):
        """
        Criptografa os campos de senha, usuario, token, chave de API e chave privada com os métodos apropriados.
        """
        if self.site:
            self.site = self.encrypt_string(self.site)

        if self.username:
            self.username = self.encrypt_string(self.username)
        
        if self.password:
            self.password = self.encrypt_string(self.password)
                      
        if self.token:
            self.token = self.encrypt_string(self.token)

        if self.api_key:
            self.api_key = self.encrypt_string(self.api_key)

        if self.private_key:
            self.private_key = self.encrypt_string(self.private_key)

        if self.public_key:
            self.public_key = self.encrypt_string(self.public_key)
        
        if self.text:
            self.text = self.encrypt_string(self.text)

    def decrypt_fields(self):
        """
        Descriptografa os campos de senha, usuario, token, chave de API e chave privada se necessário.
        """
        if self.site:
            self.site = self.decrypt_string(self.site)

        if self.username:
            self.username = self.decrypt_string(self.username)
        
        if self.password:
            self.password = self.decrypt_string(self.password)
        
        if self.token:
            self.token = self.decrypt_string(self.token)
            
        if self.api_key:
            self.api_key = self.decrypt_string(self.api_key)

        if self.private_key:
            self.private_key = self.decrypt_string(self.private_key)

        if self.public_key:
            self.public_key = self.decrypt_string(self.public_key)
            
        if self.text:
            self.text = self.decrypt_string(self.text)
