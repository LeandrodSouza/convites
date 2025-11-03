# 🎉 Chá de Panela Digital

Sistema completo de convite digital para Chá de Panela com autenticação Google, lista de presentes em tempo real e notificações por e-mail.

## 📋 Tecnologias

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Banco**: Firebase Firestore (realtime)
- **Auth**: Firebase Authentication (Google Sign-In)
- **E-mail**: Nodemailer + Gmail SMTP
- **Infra**: Docker + Docker Compose

## 🚀 Como Rodar Localmente

### 1. Pré-requisitos

- Docker e Docker Compose instalados
- Conta no Firebase (gratuita)
- Conta Gmail para envio de e-mails

### 2. Configurar Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative **Firebase Authentication** > Google Sign-In
4. Ative **Firestore Database** > Modo de produção
5. Nas configurações do projeto, copie as credenciais web
6. Vá em **Configurações do Projeto** > **Contas de Serviço** > **Gerar nova chave privada**
7. Salve o arquivo JSON como `firebase-service-account.json` na raiz do projeto

### 3. Configurar Gmail App Password

1. Acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Selecione **App**: Outro (nome personalizado) → "Cha de Panela"
3. Clique em **Gerar**
4. Copie a senha de 16 caracteres gerada

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Admins
ADMIN_EMAILS=seu-email@gmail.com,outro-admin@gmail.com

# Evento
EVENT_ADDRESS=Seu Endereço Completo do Evento

# Backend
PORT=5000
FRONTEND_URL=http://localhost:3000

# E-mail (Gmail)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua app password de 16 caracteres

# Firebase (Frontend)
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_API_URL=http://localhost:5000
VITE_EVENT_ADDRESS=Seu Endereço Completo do Evento
VITE_ADMIN_EMAILS=seu-email@gmail.com,outro-admin@gmail.com
```

### 5. Configurar Firebase Service Account

Edite o arquivo `firebase-service-account.json` com as credenciais geradas no Firebase Console.

### 6. Subir os containers Docker

```bash
docker-compose up --build
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📦 Deploy em VM (Produção)

### 1. Pré-requisitos na VM

- Ubuntu/Debian 20.04+
- Docker e Docker Compose instalados
- Domínio configurado apontando para o IP da VM
- Certificado SSL (recomendado: Let's Encrypt/Certbot)

### 2. Clonar o repositório na VM

```bash
git clone <seu-repositorio>
cd Site-convite
```

### 3. Configurar variáveis de ambiente para produção

Edite o arquivo `.env` com os dados de produção:

```env
FRONTEND_URL=https://seu-dominio.com
VITE_API_URL=https://seu-dominio.com
```

### 4. Subir em produção

```bash
docker-compose up -d
```

### 5. Configurar Nginx Reverse Proxy (Recomendado)

Instale Nginx na VM:

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

Configure o Nginx (`/etc/nginx/sites-available/cha-de-panela`):

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site e configure SSL:

```bash
sudo ln -s /etc/nginx/sites-available/cha-de-panela /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d seu-dominio.com
```

### 6. Regras de Firewall do Firebase

Configure as regras do Firestore para segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Invites - apenas leitura pública, escrita admin
    match /invites/{inviteId} {
      allow read: if true;
      allow write: if false;
    }

    // Gifts - apenas leitura pública, escrita admin
    match /gifts/{giftId} {
      allow read: if true;
      allow write: if false;
    }

    // Email logs - apenas admin
    match /emailLogs/{logId} {
      allow read, write: if false;
    }
  }
}
```

## 🎯 Funcionalidades

### Convidados:
- ✅ Login com Google
- ✅ Ativação de convite por token único
- ✅ Confirmação de presença
- ✅ Visualização do endereço após confirmação
- ✅ Escolha de presente (sem duplicação)
- ✅ Atualizações em tempo real

### Admins:
- ✅ Gerar convites únicos
- ✅ Cadastrar presentes
- ✅ Ver lista de confirmados
- ✅ Ver presentes escolhidos
- ✅ Log de e-mails enviados

### Notificações Automáticas:
- 📧 E-mail ao gerar convite
- 📧 E-mail ao confirmar presença
- 📧 E-mail ao escolher presente

## 🔒 Segurança

- Token de convite de uso único
- Autenticação via Firebase
- Transações Firestore para evitar corrida de escolha de presentes
- Middleware de autorização admin
- Regras de segurança do Firestore

## 📱 Estrutura do Banco (Firestore)

### Collection: `invites/{token}`
```json
{
  "token": "abc123def456",
  "email": "usuario@gmail.com",
  "name": "João Silva",
  "confirmed": true,
  "giftId": "gift123",
  "used": true,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### Collection: `gifts/{giftId}`
```json
{
  "name": "Panela de Pressão",
  "link": "https://...",
  "taken": true,
  "takenBy": "usuario@gmail.com",
  "takenAt": "2025-01-15T11:00:00Z",
  "createdAt": "2025-01-14T09:00:00Z"
}
```

### Collection: `emailLogs/{logId}`
```json
{
  "type": "confirm",
  "to": "admin@gmail.com",
  "subject": "João confirmou presença!",
  "sentAt": "2025-01-15T10:05:00Z"
}
```

## 🧪 Testar E-mail

Acesse o painel admin e verifique a seção "Últimos E-mails Enviados" para confirmar que os e-mails estão sendo enviados corretamente.

## 🛠️ Troubleshooting

### E-mails não estão sendo enviados
1. Verifique se o `EMAIL_USER` e `EMAIL_PASS` estão corretos no `.env`
2. Confirme que a App Password foi gerada corretamente no Gmail
3. Verifique os logs do container backend: `docker-compose logs backend`

### Erro ao fazer login com Google
1. Verifique se o Google Sign-In está ativado no Firebase Console
2. Confirme que as credenciais do Firebase estão corretas no `.env`
3. Adicione o domínio autorizado em Firebase > Authentication > Settings > Authorized domains

### Presentes sendo escolhidos em duplicata
1. As transações Firestore devem prevenir isso
2. Verifique se as regras de segurança do Firestore estão configuradas corretamente

## 📄 Licença

MIT

## 👥 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

Feito com 💖 para celebrar momentos especiais!
