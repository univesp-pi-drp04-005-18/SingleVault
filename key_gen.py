from cryptography.fernet import Fernet

# Gerando uma chave válida do tipo Fernet
SECRET_KEY = Fernet.generate_key()

# Imprimindo a chave gerada
print("Chave gerada:", SECRET_KEY.decode())