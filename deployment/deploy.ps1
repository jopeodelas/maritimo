# Script de Deploy para EC2 em PowerShell
param(
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$PemFile
)

$REPO_URL = "https://github.com/jopeodelas/maritimo.git"

Write-Host "🚀 Iniciando deploy para $EC2_IP" -ForegroundColor Green

# Função para executar comandos SSH
function Invoke-SSHCommand {
    param([string]$Command)
    
    Write-Host "Executando: $Command" -ForegroundColor Yellow
    ssh -i $PemFile -o StrictHostKeyChecking=no ec2-user@$EC2_IP $Command
}

# 1. Atualizar sistema
Write-Host "📦 Atualizando sistema..." -ForegroundColor Cyan
Invoke-SSHCommand "sudo yum update -y"

# 2. Instalar Git
Write-Host "📦 Instalando Git..." -ForegroundColor Cyan
Invoke-SSHCommand "sudo yum install -y git"

# 3. Instalar Node.js
Write-Host "📦 Instalando Node.js..." -ForegroundColor Cyan
Invoke-SSHCommand "curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -"
Invoke-SSHCommand "sudo yum install -y nodejs"

# 4. Instalar PM2
Write-Host "📦 Instalando PM2..." -ForegroundColor Cyan
Invoke-SSHCommand "sudo npm install -g pm2"

# 5. Clonar repositório
Write-Host "📦 Clonando repositório..." -ForegroundColor Cyan
Invoke-SSHCommand "mkdir -p ~/apps"
Invoke-SSHCommand "cd ~/apps && rm -rf maritimo-app || true"
Invoke-SSHCommand "cd ~/apps && git clone $REPO_URL maritimo-app"

# 6. Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
Invoke-SSHCommand "cd ~/apps/maritimo-app/server && npm install"

# 7. Build do projeto
Write-Host "📦 Fazendo build..." -ForegroundColor Cyan
Invoke-SSHCommand "cd ~/apps/maritimo-app/server && npm run build"

# 8. Criar arquivo ecosystem.config.js
Write-Host "📦 Criando configuração PM2..." -ForegroundColor Cyan
$ecosystemConfig = @"
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
"@

# Criar arquivo temporário local
$ecosystemConfig | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8

# Copiar para o servidor
scp -i $PemFile -o StrictHostKeyChecking=no "ecosystem.config.js" "ec2-user@${EC2_IP}:~/apps/maritimo-app/server/"

# Remover arquivo temporário
Remove-Item "ecosystem.config.js"

# 9. Instalar Nginx
Write-Host "📦 Instalando Nginx..." -ForegroundColor Cyan
Invoke-SSHCommand "sudo yum install -y nginx"

# 10. Configurar Nginx
Write-Host "📦 Configurando Nginx..." -ForegroundColor Cyan
$nginxConfig = @"
server {
    listen 80;
    server_name $EC2_IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
}
"@

# Criar arquivo temporário local
$nginxConfig | Out-File -FilePath "maritimo.conf" -Encoding UTF8

# Copiar para o servidor
scp -i $PemFile -o StrictHostKeyChecking=no "maritimo.conf" "ec2-user@${EC2_IP}:/tmp/"

# Mover e configurar Nginx
Invoke-SSHCommand "sudo mv /tmp/maritimo.conf /etc/nginx/conf.d/"
Invoke-SSHCommand "sudo systemctl start nginx"
Invoke-SSHCommand "sudo systemctl enable nginx"

# Remover arquivo temporário
Remove-Item "maritimo.conf"

# 11. Iniciar aplicação
Write-Host "📦 Iniciando aplicação..." -ForegroundColor Cyan
Invoke-SSHCommand "cd ~/apps/maritimo-app/server && pm2 delete maritimo-server || true"
Invoke-SSHCommand "cd ~/apps/maritimo-app/server && pm2 start ecosystem.config.js"
Invoke-SSHCommand "pm2 startup || true"
Invoke-SSHCommand "pm2 save"

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "⚠️  PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Configure o arquivo .env:" -ForegroundColor White
Write-Host "   ssh -i $PemFile ec2-user@$EC2_IP" -ForegroundColor Gray
Write-Host "   cd ~/apps/maritimo-app/server" -ForegroundColor Gray
Write-Host "   nano .env" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Reinicie após configurar:" -ForegroundColor White
Write-Host "   pm2 restart maritimo-server" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configure Security Groups no AWS para portas 80, 443, 5000" -ForegroundColor White
Write-Host ""
Write-Host "4. Teste: http://$EC2_IP/api/health" -ForegroundColor White 