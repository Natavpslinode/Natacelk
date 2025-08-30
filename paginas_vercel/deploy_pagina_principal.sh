#!/bin/bash
# Script para deployar la Aplicación Principal React a Vercel

echo "🚀 Deploying Aplicación Principal MEPROC..."
echo "📁 Directorio: pagina_principal"

cd pagina_principal

# Verificar que existe package.json
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

echo "📦 Instalando dependencias..."
npm install

echo "🔨 Construyendo proyecto..."
npm run build

echo "🌐 Desplegando a Vercel..."
npx vercel --prod

echo "✅ ¡Deployment completado!"
echo "🎯 Tu aplicación principal está lista en Vercel"
echo ""
echo "📝 RECUERDA CONFIGURAR ESTAS VARIABLES DE ENTORNO:"
echo "   VITE_SUPABASE_URL=tu_supabase_url"
echo "   VITE_SUPABASE_ANON_KEY=tu_supabase_key"