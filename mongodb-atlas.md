# Configuração do MongoDB Atlas

Para usar o MongoDB Atlas com este projeto:

1. A conexão já está configurada para ler da variável de ambiente `MONGODB_URI`
2. Para configurar, modifique o valor da variável de ambiente no `docker-compose.yml`:

```yaml
environment:
  - MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@seu_cluster.mongodb.net/credenciais_db
```

Certifique-se de substituir:
- `seu_usuario` com seu nome de usuário do Atlas
- `sua_senha` com sua senha do Atlas
- `seu_cluster` com o nome do seu cluster no Atlas

Nota: Mantenha suas credenciais seguras e nunca as cometa no controle de versão.