#!/bin/bash

# Script para convertir imágenes a formato WebP
# Requiere: cwebp (parte de libwebp)

echo "=== Conversión de imágenes a WebP ==="
echo ""

# Lista de imágenes específicas de proyectos que necesitamos convertir
IMAGES=(
    # Proyecto 1: Edificio Sede CORPOELEC Cumaná
    "project-corpoelec-cumana.jpg"
    "project-corpoelec-cumana2.jpg"
    
    # Proyecto 2: Subestación Manzanares
    "Manzares_portada.png"
    "project-subestacion-manzanares.jpg"
    "project-subestacion2.jpg"
    
    # Proyecto 3: Subestación Araya
    "project-subestacion-araya.jpg"
    "project-subestacion-araya5.jpg"
    
    # Proyecto 4: Centro de Alimentación Guanta
    "PORTADA_GUANTA.jpg"
    "project-alimentacion-guanta.jpg"
    
    # Proyecto 5: UNEXEE Núcleo Falcón
    "project-unexee.jpg"
    "project-unexee2.jpg"
    
    # Proyecto 6: Subestación Chuparín
    "Chuparin-portada.jpg"
    "Chuparin-1.jpg"
    "Chuparin-2.jpg"
    
    # Proyecto 7: Subestación Casanay
    "Casanay_portada.png"
    "project-subestacion-manzanares.jpg"
    "project-subestacion2.jpg"
    
    # Proyecto 8: Estacionamiento Sede CORPOELEC
    "Estacionamiento1.png"
    "Estacionamiento2.png"
    "Estacionamiento3.png"
    
    # Proyecto 9: Centro de Atención Cariaco
    "Cariaco1.png"
    "Cariaco2.png"
    
    # Proyecto 10: Adecuación Sede CORPOELEC ARAYA
    "Nueva-araya3.png"
    "Nueva-araya.png"
    "Nueva-araya2.png"
    
    # Proyecto 11: Comedor Apure
    "comedor-apure.jpg"
    "Comedor-apure2.jpg"
    "Comedor-apure3.jpg"
    "Comedor-apure4.jpg"
)

# Verificar si cwebp está instalado
if ! command -v cwebp &> /dev/null; then
    echo "⚠️  cwebp no está instalado."
    echo "Instala con: brew install webp (macOS) o apt-get install webp (Ubuntu)"
    exit 1
fi

echo "✅ cwebp encontrado"
echo ""

# Contadores
total_images=${#IMAGES[@]}
converted=0
skipped=0

echo "Convirtiendo $total_images imágenes..."
echo ""

for img in "${IMAGES[@]}"; do
    # Verificar si la imagen existe
    if [ -f "$img" ]; then
        # Extraer nombre sin extensión
        filename="${img%.*}"
        
        # Crear nombre de salida .webp
        output="${filename}.webp"
        
        echo "Convirtiendo: $img → $output"
        
        # Convertir usando cwebp con calidad 85% (buena relación calidad/tamaño)
        cwebp -q 85 "$img" -o "$output"
        
        if [ $? -eq 0 ]; then
            # Calcular reducción de tamaño
            orig_size=$(stat -c%s "$img" 2>/dev/null || stat -f%z "$img" 2>/dev/null)
            new_size=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output" 2>/dev/null)
            reduction=$((100 - (new_size * 100 / orig_size)))
            
            echo "  ✅ Convertido: $orig_size bytes → $new_size bytes (-$reduction%)"
            converted=$((converted + 1))
        else
            echo "  ❌ Error al convertir: $img"
        fi
    else
        echo "⚠️  Imagen no encontrada: $img"
        skipped=$((skipped + 1))
    fi
done

echo ""
echo "=== Resumen ==="
echo "Total de imágenes: $total_images"
echo "Convertidas: $converted"
echo "No encontradas: $skipped"
echo ""
echo "Las imágenes .webp están listas para usar."
echo "Recuerda actualizar las referencias en el código TypeScript."
