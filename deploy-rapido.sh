#!/bin/bash

echo "🚀 Deploy Rápido para Produção"
echo "================================"
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto!"
    exit 1
fi

echo "📦 Passo 1: Construindo imagem Docker..."
docker build -t simuladores-app:latest . || {
    echo "❌ Erro ao construir imagem"
    exit 1
}

echo ""
echo "💾 Passo 2: Exportando imagem..."
docker save simuladores-app:latest | gzip > simuladores-app.tar.gz || {
    echo "❌ Erro ao exportar imagem"
    exit 1
}

echo ""
echo "📤 Passo 3: Transferindo para servidor..."
echo "Senha: <SENHA_DO_SERVIDOR>"
scp simuladores-app.tar.gz double@10.10.50.246:~/ || {
    echo "❌ Erro ao transferir imagem"
    exit 1
}

echo ""
echo "📤 Passo 4: Transferindo arquivos de configuração..."
scp .env.production double@10.10.50.246:~/simuladores/ 2>/dev/null
scp docker-compose.yml double@10.10.50.246:~/simuladores/ 2>/dev/null
scp docker-compose.prod.yml double@10.10.50.246:~/simuladores/ 2>/dev/null
scp deploy.sh double@10.10.50.246:~/simuladores/ 2>/dev/null

echo ""
echo "✅ Arquivos transferidos com sucesso!"
echo ""
echo "🔧 Passo 5: Instalando no servidor..."
echo "Conecte-se ao servidor e execute:"
echo ""
echo "  ssh double@10.10.50.246"
echo "  cd ~/simuladores"
echo "  sudo ./deploy.sh install-on-server"
echo ""
echo "Ou execute automaticamente:"
read -p "Deseja executar a instalação automaticamente? (s/n): " resposta

if [ "$resposta" = "s" ] || [ "$resposta" = "S" ]; then
    echo ""
    echo "🔧 Instalando no servidor..."
    echo "Senha SSH: <SENHA_DO_SERVIDOR>"
    echo "Senha Sudo: <SENHA_DO_SERVIDOR>"
    
    ssh -t double@10.10.50.246 "cd ~/simuladores && sudo ./deploy.sh install-on-server"
    
    echo ""
    echo "✅ Deploy concluído!"
    echo ""
    echo "🌐 Acesse: http://10.10.50.246:3009"
    echo "🌐 Ou: http://simulador-dre.doubletelecom.com.br"
else
    echo ""
    echo "⚠️  Não esqueça de executar no servidor:"
    echo "  ssh double@10.10.50.246"
    echo "  cd ~/simuladores"
    echo "  sudo ./deploy.sh install-on-server"
fi

echo ""
echo "🧹 Limpando arquivo temporário..."
rm -f simuladores-app.tar.gz

echo ""
echo "✅ Processo finalizado!"
