from fastapi import FastAPI
from routes import users, credentials
from fastapi.middleware.cors import CORSMiddleware

# Criando a instância do FastAPI
app = FastAPI(title='Password Manager')

# Adicionando suporte ao CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite requisições de qualquer origem. Você pode restringir aqui se necessário
    allow_credentials=True,
    allow_methods=["*"],  # Permite qualquer método HTTP
    allow_headers=["*"],  # Permite qualquer cabeçalho
)

# Registrando as rotas
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(credentials.router, prefix="/credentials", tags=["Credentials"])

if __name__ == '__main__':
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8083, log_level='info', reload=True)
