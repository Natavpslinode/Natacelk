#!/bin/bash
# Script para deployar Recursos Estáticos a Vercel

echo "🖼️  Deploying Recursos Estáticos MEPROC..."
echo "📁 Directorio: pagina_recursos"

cd pagina_recursos

# Crear index.html para servir como sitio estático
echo "📄 Creando index.html..."
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recursos MEPROC</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .image-item { text-align: center; }
        img { max-width: 100%; height: 150px; object-fit: cover; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 Recursos MEPROC</h1>
        <p>Imágenes y recursos estáticos para la plataforma educativa</p>
        <div class="image-grid">
            <!-- Las imágenes se cargarán aquí -->
        </div>
    </div>
</body>
</html>
EOF

# Crear package.json básico para Vercel
cat > package.json << 'EOF'
{
  "name": "meproc-recursos",
  "version": "1.0.0",
  "description": "Recursos estáticos MEPROC",
  "main": "index.html",
  "scripts": {
    "build": "echo 'Static site - no build required'"
  }
}
EOF

echo "🌐 Desplegando a Vercel..."
npx vercel --prod

echo "✅ ¡Deployment completado!"
echo "🎯 Tus recursos estáticos están listos en Vercel"
echo "💡 Usa esta URL como CDN para las imágenes en tu app principal"