#!/bin/bash

# Script para crear placeholders .webp inmediatamente
# Esto permite que el sitio funcione mientras se convierten las imágenes reales

echo "=== Creando placeholders .webp ==="
echo ""

cd public || { echo "Error: No se pudo entrar al directorio public"; exit 1; }

# Lista de imágenes CRÍTICAS que deben existir para que el sitio funcione
CRITICAL_IMAGES=(
    # Proyecto 1
    "project-corpoelec-cumana.jpg"
    "project-corpoelec-cumana2.jpg"
    
    # Proyecto 2
    "Manzares_portada.png"
    "project-subestacion-manzanares.jpg"
    "project-subestacion2.jpg"
    
    # Proyecto 3
    "project-subestacion-araya.jpg"
    "project-subestacion-araya5.jpg"
    
    # Proyecto 4
    "PORTADA_GUANTA.jpg"
    "project-alimentacion-guanta.jpg"
    
    # Proyecto 5
    "project-unexee.jpg"
    "project-unexee2.jpg"
    
    # Proyecto 6
    "Chuparin-portada.jpg"
    "Chuparin-1.jpg"
    "Chuparin-2.jpg"
    
    # Proyecto 7
    "Casanay_portada.png"
    
    # Proyecto 8
    "Estacionamiento1.png"
    "Estacionamiento2.png"
    "Estacionamiento3.png"
    
    # Proyecto 9
    "Cariaco1.png"
    "Cariaco2.png"
    
    # Proyecto 10
    "Nueva-araya3.png"
    "Nueva-araya.png"
    "Nueva-araya2.png"
    
    # Proyecto 11
    "comedor-apure.jpg"
)

echo "Buscando imágenes críticas..."
echo ""

created=0
missing=0

for img in "${CRITICAL_IMAGES[@]}"; do
    webp_name="${img%.*}.webp"
    
    if [ -f "$img" ]; then
        # Verificar si ya existe el .webp
        if [ ! -f "$webp_name" ]; then
            echo "Creando placeholder: $webp_name"
            # Crear una copia (placeholder temporal)
            cp "$img" "$webp_name"
            created=$((created + 1))
        else
            echo "✅ Ya existe: $webp_name"
        fi
    else
        echo "⚠️  No encontrada: $img"
        missing=$((missing + 1))
    fi
done

echo ""
echo "=== Resumen ==="
echo "Placeholders creados: $created"
echo "Imágenes no encontradas: $missing"
echo ""
echo "IMPORTANTE: Estos son placeholders temporales (copias de JPG/PNG)."
echo "Para obtener los beneficios reales de WebP, necesitas:"
echo "1. Instalar ImageMagick: brew install imagemagick"
echo "2. Convertir imágenes reales: convert imagen.jpg -quality 85 imagen.webp"
echo "3. Reemplazar estos placeholders con WebP optimizados"
echo ""
echo "El sitio web funcionará con estos placeholders, pero el tamaño no se reducirá."