# Guia de Deploy do Servidor no EC2

## 1. Conectar à Instância EC2

```bash
# Se ainda não tem a chave privada, baixe-a do AWS Console
# Conecte-se à instância (substitua pelos seus valores)
ssh -i "sua-chave-privada.pem" ec2-user@13.60.228.50

# Ou se for Ubuntu:
ssh -i "sua-chave-privada.pem" ubuntu@13.60.228.50
```

## 2. Preparar o Ambiente na Instância EC2

```bash
# Atualizar o sistema
sudo yum update -y  # Para Amazon Linux
# ou
sudo apt update && sudo apt upgrade -y  # Para Ubuntu

# Instalar Node.js (versão 18 LTS)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -  # Amazon Linux
sudo yum install -y nodejs  # Amazon Linux
# ou
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -  # Ubuntu
sudo apt-get install -y nodejs  # Ubuntu

# Verificar instalação
node --version
npm --version

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Git (se não estiver instalado)
sudo yum install -y git  # Amazon Linux
# ou
sudo apt install -y git  # Ubuntu
```

## 3. Clonar o Repositório

```bash
# Criar diretório para a aplicação
mkdir -p ~/apps
cd ~/apps

# Clonar o repositório (substitua pela URL do seu repo)
git clone https://github.com/seu-usuario/seu-repositorio.git maritimo-app
cd maritimo-app/server
```

## 4. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano .env
```

**Conteúdo do arquivo .env:**
```env
# Servidor
NODE_ENV=production
PORT=5000

# Base de Dados (substitua pelos valores da sua RDS)
DB_HOST=seu-rds-endpoint.amazonaws.com
DB_USER=postgres
DB_PASSWORD=sua-senha-rds
DB_NAME=maritimo_voting
DB_PORT=5432

# JWT
JWT_SECRET=uma-chave-secreta-muito-forte-aqui
JWT_EXPIRY=24h
COOKIE_SECRET=outra-chave-secreta-para-cookies

# URL do Cliente (GitHub Pages)
CLIENT_URL=https://seu-usuario.github.io/seu-repositorio

# Google OAuth (se usar)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_REDIRECT_URI=http://13.60.228.50:5000/api/auth/google/callback

# APIs Externas (opcionais)
NEWS_API_KEY=sua-chave-news-api
RAPIDAPI_KEY=sua-chave-rapidapi
FOOTBALL_DATA_TOKEN=seu-token-football-data
MARITIMO_FOOTBALL_DATA_ID=5529
```

## 5. Instalar Dependências e Build

```bash
# Instalar dependências
npm install

# Build do TypeScript
npm run build

# Verificar se o build foi criado
ls -la dist/
```

## 6. Configurar PM2

```bash
# Criar arquivo de configuração do PM2
nano ecosystem.config.js
```

**Conteúdo do ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'maritimo-server',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

```bash
# Iniciar a aplicação com PM2
pm2 start ecosystem.config.js

# Verificar status
pm2 status

# Ver logs
pm2 logs maritimo-server

# Configurar PM2 para iniciar automaticamente no boot
pm2 startup
pm2 save
```

## 7. Configurar Security Groups no AWS

No AWS Console, vá para EC2 > Security Groups:

1. Selecione o Security Group da sua instância
2. Adicione as seguintes regras de entrada:
   - **HTTP**: Port 80, Source: 0.0.0.0/0
   - **HTTPS**: Port 443, Source: 0.0.0.0/0
   - **Custom TCP**: Port 5000, Source: 0.0.0.0/0
   - **SSH**: Port 22, Source: Seu IP

## 8. Configurar Nginx (Recomendado)

```bash
# Instalar Nginx
sudo yum install -y nginx  # Amazon Linux
# ou
sudo apt install -y nginx  # Ubuntu

# Configurar Nginx
sudo nano /etc/nginx/sites-available/maritimo  # Ubuntu
# ou
sudo nano /etc/nginx/conf.d/maritimo.conf  # Amazon Linux
```

**Configuração do Nginx:**
```nginx
server {
    listen 80;
    server_name 13.60.228.50;  # Substitua pelo seu IP ou domínio

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Para Ubuntu, criar link simbólico
sudo ln -s /etc/nginx/sites-available/maritimo /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Iniciar/reiniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl reload nginx
```

## 9. Teste da API

```bash
# Testar se o servidor está rodando
curl http://localhost:5000/api/health

# Testar externamente
curl http://13.60.228.50/api/health
```

## 10. Atualizar Client com URL do Servidor

No seu client (GitHub Pages), atualize a URL da API para:
```
https://13.60.228.50/api
```
ou se configurou um domínio:
```
https://seu-dominio.com/api
```

## 11. Comandos Úteis de Manutenção

```bash
# Ver logs da aplicação
pm2 logs maritimo-server

# Reiniciar aplicação
pm2 restart maritimo-server

# Parar aplicação
pm2 stop maritimo-server

# Atualizar código
cd ~/apps/maritimo-app
git pull origin main
cd server
npm run build
pm2 restart maritimo-server

# Monitorar recursos
pm2 monit

# Ver status do Nginx
sudo systemctl status nginx

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 12. Configuração de CORS

Certifique-se de que o CORS está configurado corretamente no servidor para aceitar requests do seu domínio do GitHub Pages.

## Troubleshooting

### Se a aplicação não iniciar:
1. Verifique os logs: `pm2 logs maritimo-server`
2. Verifique se as variáveis de ambiente estão corretas
3. Teste a conexão com a base de dados
4. Verifique se a porta 5000 está disponível: `sudo netstat -tlnp | grep :5000`

### Se não conseguir aceder externamente:
1. Verifique os Security Groups do AWS
2. Verifique se o Nginx está a correr: `sudo systemctl status nginx`
3. Verifique os logs do Nginx
4. Teste a conectividade: `telnet 13.60.228.50 80` 