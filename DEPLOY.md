# Guia de Deploy para Produção

## 🚀 Opções de Hospedagem

### 1. VPS/Cloud (Recomendado)
- **DigitalOcean** (mais fácil): US$ 6/mês
- **AWS EC2**: Tier gratuito disponível
- **Google Cloud**: Créditos gratuitos para novos usuários
- **Vultr, Linode**: Opções econômicas

### 2. Plataformas Simplificadas
- **Railway**: Deploy automático via Git
- **Render**: Plano gratuito disponível
- **Fly.io**: Boa opção para containers

---

## 📋 Pré-requisitos

1. **Servidor com:**
   - Ubuntu 20.04+ ou Debian
   - Mínimo 1GB RAM
   - Docker e Docker Compose instalados

2. **Domínio (opcional mas recomendado):**
   - Registre em: Registro.br, Namecheap, GoDaddy, etc.
   - Configure DNS apontando para IP do servidor

3. **Arquivos necessários:**
   - Código do projeto
   - `firebase-service-account.json`
   - Variáveis de ambiente configuradas

---

## 🔧 Passo a Passo (VPS/Cloud)

### 1. Preparar Servidor

```bash
# Conectar via SSH
ssh root@SEU_IP_DO_SERVIDOR

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Criar usuário (opcional, mais seguro)
adduser deploy
usermod -aG docker deploy
su - deploy
```

### 2. Enviar Código para Servidor

**Opção A: Git (Recomendado)**
```bash
# No servidor
cd ~
git clone https://github.com/SEU_USUARIO/SEU_REPO.git convites
cd convites
```

**Opção B: SCP (copiar arquivos)**
```bash
# No seu PC (PowerShell)
scp -r C:\convites root@SEU_IP:/root/
```

### 3. Configurar Variáveis de Ambiente

```bash
# No servidor, dentro da pasta convites
cd ~/convites

# Criar arquivo .env no backend
cat > backend/.env << EOF
NODE_ENV=production
PORT=5000
ADMIN_EMAILS=seu-email@gmail.com
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=seu-client-email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
EOF

# Criar arquivo .env no frontend
cat > frontend/.env.production << EOF
VITE_API_URL=http://SEU_IP_OU_DOMINIO
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=seu-app-id
VITE_ADMIN_EMAILS=seu-email@gmail.com
EOF
```

### 4. Copiar Firebase Service Account

```bash
# Coloque o arquivo firebase-service-account.json na raiz do projeto
# Use SCP ou crie manualmente com nano/vim

nano firebase-service-account.json
# Cole o conteúdo e salve (Ctrl+X, Y, Enter)
```

### 5. Iniciar Aplicação na Porta 80

```bash
# Usando docker-compose de produção
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar se está rodando
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 6. Liberar Porta 80 no Firewall

```bash
# Ubuntu/Debian com ufw
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable

# Verificar status
ufw status
```

---

## 🔒 Configurar HTTPS (SSL) - IMPORTANTE!

### Usar Let's Encrypt (Gratuito)

```bash
# Instalar Certbot
apt install certbot -y

# Gerar certificado (substitua seu-dominio.com)
certbot certonly --standalone -d seu-dominio.com -d www.seu-dominio.com

# Certificados serão salvos em:
# /etc/letsencrypt/live/seu-dominio.com/

# Criar pasta para SSL
mkdir -p nginx/ssl

# Copiar certificados
cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem nginx/ssl/

# Editar nginx.prod.conf e descomentar bloco HTTPS
nano nginx/nginx.prod.conf
# Remova os comentários (#) das linhas do servidor HTTPS
# Substitua "seu-dominio.com" pelo seu domínio real

# Reiniciar containers
docker-compose -f docker-compose.prod.yml restart
```

### Renovação Automática do Certificado

```bash
# Configurar cron para renovar automaticamente
crontab -e

# Adicionar esta linha (renova a cada 2 meses):
0 3 1 */2 * certbot renew --quiet && docker-compose -f /root/convites/docker-compose.prod.yml restart frontend
```

---

## 🌐 Configurar DNS (se tiver domínio)

No painel do seu registrador de domínio:

```
Tipo: A
Nome: @
Valor: SEU_IP_DO_SERVIDOR
TTL: 3600

Tipo: A
Nome: www
Valor: SEU_IP_DO_SERVIDOR
TTL: 3600
```

---

## 📱 Atualizar Firebase

### 1. Adicionar domínio nos domínios autorizados

```
Firebase Console → Authentication → Settings → Authorized domains
Adicionar: seu-dominio.com
```

### 2. Atualizar VITE_API_URL no frontend

```bash
# Editar .env.production
VITE_API_URL=https://seu-dominio.com  # ou http://seu-ip se não tiver SSL
```

---

## 🔄 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar serviços
docker-compose -f docker-compose.prod.yml restart

# Parar tudo
docker-compose -f docker-compose.prod.yml down

# Rebuild após mudanças
docker-compose -f docker-compose.prod.yml up -d --build

# Limpar containers antigos
docker system prune -a
```

---

## 🐛 Troubleshooting

### Porta 80 em uso
```bash
# Ver o que está usando a porta 80
lsof -i :80

# Parar Apache (se instalado)
systemctl stop apache2
systemctl disable apache2
```

### Frontend não carrega
```bash
# Verificar se API_URL está correto
cat frontend/.env.production

# Verificar logs do frontend
docker-compose -f docker-compose.prod.yml logs frontend
```

### Backend não conecta Firebase
```bash
# Verificar se firebase-service-account.json existe
ls -la firebase-service-account.json

# Ver logs do backend
docker-compose -f docker-compose.prod.yml logs backend
```

---

## 💡 Dicas de Segurança

1. **Sempre use HTTPS em produção**
2. **Mantenha servidor atualizado**: `apt update && apt upgrade`
3. **Configure firewall**: Apenas portas 80, 443 e 22 abertas
4. **Backups regulares**: Firestore já tem backup automático, mas faça backup do código
5. **Monitore logs**: `docker-compose logs` regularmente
6. **Use senhas fortes** para SSH e Firebase

---

## 📊 Monitoramento (Opcional)

### Instalar Portainer (Interface Web para Docker)

```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name portainer --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce

# Acesse: http://SEU_IP:9000
```

---

## 💰 Custos Estimados

- **VPS DigitalOcean**: US$ 6/mês (1GB RAM)
- **Domínio .com.br**: R$ 40/ano
- **SSL Let's Encrypt**: GRATUITO
- **Firebase**: GRATUITO até certo limite

**Total**: ~R$ 40-50/mês

---

## 🚀 Deploy Rápido (Resumo)

```bash
# 1. Conectar ao servidor
ssh root@SEU_IP

# 2. Instalar Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose -y

# 3. Clonar projeto
git clone SEU_REPO convites && cd convites

# 4. Configurar variáveis
nano backend/.env
nano frontend/.env.production
nano firebase-service-account.json

# 5. Iniciar
docker-compose -f docker-compose.prod.yml up -d --build

# 6. Abrir firewall
ufw allow 80/tcp && ufw enable

# Pronto! Acesse: http://SEU_IP
```

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique logs: `docker-compose logs`
2. Google o erro específico
3. Documentação Docker: https://docs.docker.com
4. Let's Encrypt: https://letsencrypt.org
