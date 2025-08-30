#!/bin/bash
# Script maestro para deployar todas las páginas

echo "🚀 DEPLOYMENT COMPLETO MEPROC - 3 PÁGINAS"
echo "============================================"

# Hacer ejecutables los scripts
chmod +x deploy_pagina_principal.sh
chmod +x deploy_pagina_recursos.sh

echo "📋 ORDEN DE DEPLOYMENT:"
echo "1️⃣  Recursos Estáticos (CDN)"
echo "2️⃣  Aplicación Principal"
echo "3️⃣  Funciones Supabase (manual)"
echo ""

read -p "🤔 ¿Continuar con el deployment automático? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    
    echo "\n🖼️  PASO 1: Desplegando Recursos..."
    ./deploy_pagina_recursos.sh
    
    echo "\n⏳ Esperando 30 segundos..."
    sleep 30
    
    echo "\n📱 PASO 2: Desplegando Aplicación Principal..."
    ./deploy_pagina_principal.sh
    
    echo "\n⚡ PASO 3: Funciones Supabase"
    echo "📝 Para las funciones de Supabase, ejecuta manualmente:"
    echo "   cd pagina_supabase"
    echo "   supabase login"
    echo "   supabase link --project-ref TU_PROYECTO_ID"
    echo "   supabase functions deploy"
    
    echo "\n🎉 ¡DEPLOYMENT COMPLETADO!"
    echo "✅ Recursos: Desplegados"
    echo "✅ App Principal: Desplegada"
    echo "⏳ Supabase: Pendiente (manual)"
    
else
    echo "❌ Deployment cancelado"
fi