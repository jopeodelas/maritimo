#!/bin/bash

# Script de Deploy Automatizado para EC2
# Uso: ./deploy.sh [IP_DA_INSTANCIA] [CAMINHO_CHAVE_PRIVADA]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar argumentos
if [ $# -ne 2 ]; then
    print_error "Uso: $0 <IP_DA_INSTANCIA> <CAMINHO_CHAVE_PRIVADA>"
    print_error "Exemplo: $0 13.60.228.50 ~/.ssh/maritimo-key.pem"
    exit 1
fi

EC2_IP=$1
PEM_KEY=$2
REPO_URL="https://github.com/jopeodelas/maritimo.git"

print_status "Iniciando deploy para $EC2_IP"

# Verificar se a chave existe
if [ ! -f "$PEM_KEY" ]; then
    print_error "Chave privada não encontrada: $PEM_KEY"
    exit 1
fi

# Definir comando SSH
SSH_CMD="ssh -i $PEM_KEY -o StrictHostKeyChecking=no ec2-user@$EC2_IP"

print_status "Conectando à instância EC2..."

# Função para executar comandos remotos
remote_exec() {
    $SSH_CMD "$1"
}

# Função para copiar arquivos
copy_file() {
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no "$1" "ec2-user@$EC2_IP:$2"
}

# 1. Atualizar sistema e instalar dependências
print_status "Instalando dependências básicas..."
remote_exec "sudo yum update -y"
remote_exec "sudo yum install -y git"

# 2. Instalar Node.js
print_status "Instalando Node.js..."
remote_exec "curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -"
remote_exec "sudo yum install -y nodejs"

# 3. Instalar PM2
print_status "Instalando PM2..."
remote_exec "sudo npm install -g pm2"

# 4. Clonar ou atualizar repositório
print_status "Clonando/atualizando repositório..."
remote_exec "mkdir -p ~/apps"
remote_exec "cd ~/apps && rm -rf maritimo-app || true"
remote_exec "cd ~/apps && git clone $REPO_URL maritimo-app"

# 5. Copiar arquivos de configuração
print_status "Copiando arquivos de configuração..."
cat > /tmp/ecosystem.config.js << 'EOF'
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
EOF

copy_file "/tmp/ecosystem.config.js" "~/apps/maritimo-app/server/"

# 6. Instalar dependências e build
print_status "Instalando dependências e fazendo build..."
remote_exec "cd ~/apps/maritimo-app/server && npm install"
remote_exec "cd ~/apps/maritimo-app/server && npm run build"

# 7. Configurar Nginx
print_status "Instalando e configurando Nginx..."
remote_exec "sudo yum install -y nginx"

cat > /tmp/nginx.conf << EOF
server {
    listen 80;
    server_name $EC2_IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

copy_file "/tmp/nginx.conf" "/tmp/maritimo.conf"
remote_exec "sudo mv /tmp/maritimo.conf /etc/nginx/conf.d/"
remote_exec "sudo systemctl start nginx"
remote_exec "sudo systemctl enable nginx"

# 8. Configurar e iniciar aplicação
print_status "Configurando PM2..."
remote_exec "cd ~/apps/maritimo-app/server && pm2 delete maritimo-server || true"
remote_exec "cd ~/apps/maritimo-app/server && pm2 start ecosystem.config.js"
remote_exec "pm2 startup || true"
remote_exec "pm2 save"

# 9. Limpar arquivos temporários
rm -f /tmp/ecosystem.config.js /tmp/nginx.conf

print_status "Deploy concluído!"
print_warning "AÇÕES NECESSÁRIAS:"
echo "1. Configure o arquivo .env na instância EC2:"
echo "   ssh -i $PEM_KEY ec2-user@$EC2_IP"
echo "   cd ~/apps/maritimo-app/server"
echo "   nano .env"
echo ""
echo "2. Reinicie a aplicação após configurar o .env:"
echo "   pm2 restart maritimo-server"
echo ""
echo "3. Configure os Security Groups no AWS Console para permitir tráfego nas portas 80, 443 e 5000"
echo ""
echo "4. Teste a aplicação:"
echo "   curl http://$EC2_IP/api/health"
print_status "Servidor disponível em: http://$EC2_IP" 