#!/bin/bash

# Script de Deploy para Produção
# Execute: bash deploy.sh

echo "🚀 Iniciando deploy de produção..."

# Verificar se docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Verificar se docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instalando..."
    apt install -y docker-compose
fi

# Verificar se arquivos de ambiente existem
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Arquivo backend/.env não encontrado!"
    echo "Copie backend/.env.example para backend/.env e configure"
    exit 1
fi

if [ ! -f "frontend/.env.production" ]; then
    echo "⚠️  Arquivo frontend/.env.production não encontrado!"
    echo "Copie frontend/.env.production.example para frontend/.env.production e configure"
    exit 1
fi

if [ ! -f "firebase-service-account.json" ]; then
    echo "⚠️  Arquivo firebase-service-account.json não encontrado!"
    echo "Faça upload do arquivo de credenciais do Firebase"
    exit 1
fi

# Parar containers antigos
echo "🛑 Parando containers antigos..."
docker-compose -f docker-compose.prod.yml down

# Limpar imagens antigas (opcional)
read -p "Limpar imagens Docker antigas? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    docker system prune -a -f
fi

# Build e iniciar
echo "🔨 Construindo e iniciando containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar status
echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📝 Para ver logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🌐 Acesse sua aplicação:"
echo "   http://$(curl -s ifconfig.me)"
echo ""
