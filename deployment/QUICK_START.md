# 🚀 Guia Rápido de Deploy - EC2

## ⚡ Deploy Automático (Recomendado)

```bash
# 1. Edite o script e adicione a URL do seu repositório
nano deployment/deploy.sh
# Altere a linha: REPO_URL="https://github.com/seu-usuario/seu-repositorio.git"

# 2. Execute o deploy
./deployment/deploy.sh 13.60.228.50 /caminho/para/sua-chave.pem

# 3. Configure o .env na instância
ssh -i /caminho/para/sua-chave.pem ec2-user@13.60.228.50
cd ~/apps/maritimo-app/server
cp ../../../deployment/env.template .env
nano .env  # Configure com seus dados reais

# 4. Reinicie a aplicação
pm2 restart maritimo-server
```

## 📋 Checklist Pós-Deploy

- [ ] **Security Groups configurados no AWS**
  - Porta 80 (HTTP): 0.0.0.0/0
  - Porta 443 (HTTPS): 0.0.0.0/0  
  - Porta 22 (SSH): Seu IP
  - Porta 5000 (API): 0.0.0.0/0

- [ ] **Arquivo .env configurado** com:
  - [ ] Dados da RDS (DB_HOST, DB_USER, DB_PASSWORD, etc.)
  - [ ] JWT_SECRET e COOKIE_SECRET únicos
  - [ ] CLIENT_URL do GitHub Pages
  - [ ] APIs externas (opcional)

- [ ] **Testes funcionais**:
  ```bash
  # API Health Check
  curl http://13.60.228.50/api/health
  
  # Teste CORS
  curl -H "Origin: https://seu-usuario.github.io" http://13.60.228.50/api/health
  ```

- [ ] **Frontend atualizado** com URL da API: `http://13.60.228.50/api`

## 🛠️ Comandos Úteis

```bash
# Conectar à instância
ssh -i sua-chave.pem ec2-user@13.60.228.50

# Ver logs da aplicação
pm2 logs maritimo-server

# Reiniciar aplicação
pm2 restart maritimo-server

# Status dos serviços
pm2 status
sudo systemctl status nginx

# Atualizar código
cd ~/apps/maritimo-app
git pull origin main
cd server
npm run build
pm2 restart maritimo-server
```

## 🚨 Troubleshooting

### Aplicação não inicia
1. `pm2 logs maritimo-server` - verificar erros
2. Verificar se .env está configurado corretamente
3. Testar conexão com base de dados

### Não consegue aceder externamente  
1. Verificar Security Groups no AWS
2. `sudo systemctl status nginx`
3. `curl http://localhost:5000/api/health` (dentro da instância)

### Problemas de CORS
1. Verificar CLIENT_URL no .env
2. Verificar configuração CORS no código do servidor

## 🔗 URLs Importantes

- **API**: http://13.60.228.50/api
- **Health Check**: http://13.60.228.50/api/health
- **Frontend**: Atualizar URL da API no código do cliente 