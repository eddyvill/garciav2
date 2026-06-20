#!/bin/bash

# Script simple para convertir imágenes a WebP
# Usa herramientas disponibles en macOS

echo "=== Conversión de imágenes a WebP (macOS) ==="
echo ""

# Primero, verificar si tenemos herramientas disponibles
echo "Verificando herramientas disponibles..."

# Verificar si sips (herramienta nativa de macOS) está disponible
if command -v sips &> /dev/null; then
    echo "✅ sips encontrado (herramienta nativa de macOS)"
    CONVERTER="sips"
elif command -v magick &> /dev/null; then
    echo "✅ ImageMagick (magick) encontrado"
    CONVERTER="magick"
else
    echo "⚠️  No se encontraron herramientas de conversión"
    echo "Instala ImageMagick con: brew install imagemagick"
    exit 1
fi

# Cambiar al directorio public
cd public || { echo "Error: No se pudo cambiar al directorio public"; exit 1; }

# Lista de imágenes importantes que sabemos que existen
IMAGES_EXIST=()

# Verificar qué imágenes existen realmente
echo ""
echo "Buscando imágenes existentes..."

check_images() {
    local images_to_check=(
        "project-corpoelec-cumana.jpg"
        "project-corpoelec-cumana2.jpg"
        "Manzares_portada.png"
        "project-subestacion-manzanares.jpg"
        "project-subestacion2.jpg"
        "project-subestacion-araya.jpg"
        "project-subestacion-araya5.jpg"
        "project-alimentacion-guanta.jpg"
        "project-unexee.jpg"
        "project-unexee2.jpg"
        "Chuparin-portada.jpg"
        "Chuparin-1.jpg"
        "Chuparin-2.jpg"
        "Casanay_portada.png"
        "Estacionamiento1.png"
        "Estacionamiento2.png"
        "Estacionamiento3.png"
        "Cariaco1.png"
        "Cariaco2.png"
        "Nueva-araya3.png"
        "Nueva-araya.png"
        "Nueva-araya2.png"
        "comedor-apure.jpg"
    )
    
    for img in "${images_to_check[@]}"; do
        if [ -f "$img" ]; then
            IMAGES_EXIST+=("$img")
            echo "✅ Encontrada: $img"
        else
            echo "⚠️  No encontrada: $img"
        fi
    done
}

check_images

echo ""
echo "Encontradas ${#IMAGES_EXIST[@]} imágenes para convertir"
echo ""

if [ ${#IMAGES_EXIST[@]} -eq 0 ]; then
    echo "No hay imágenes para convertir"
    exit 0
fi

# Para sips (herramienta nativa de macOS)
convert_with_sips() {
    local input="$1"
    local output="${input%.*}.webp"
    
    echo "Convirtiendo con sips: $input → $output"
    
    # sips no soporta WebP directamente, necesitamos otro método
    echo "  ⚠️  sips no soporta WebP directamente"
    echo "  Usando conversión alternativa..."
    
    # Intentar con cwebp si está disponible
    if command -v cwebp &> /dev/null; then
        cwebp -q 80 "$input" -o "$output"
        return $?
    else
        echo "  ❌ cwebp no está instalado"
        echo "  Instala con: brew install webp"
        return 1
    fi
}

# Para ImageMagick
convert_with_magick() {
    local input="$1"
    local output="${input%.*}.webp"
    
    echo "Convirtiendo con ImageMagick: $input → $output"
    magick "$input" -quality 85 "$output"
    return $?
}

# Procesar conversiones
converted=0
failed=0

echo "Iniciando conversión..."
echo ""

for img in "${IMAGES_EXIST[@]}"; do
    filename="${img%.*}"
    output="${filename}.webp"
    
    # Saltar si ya existe el WebP
    if [ -f "$output" ]; then
        echo "✅ Ya existe: $output (saltando)"
        continue
    fi
    
    case $CONVERTER in
        "sips")
            convert_with_sips "$img"
            ;;
        "magick")
            convert_with_magick "$img"
            ;;
        *)
            echo "❌ Conversor no soportado: $CONVERTER"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ] && [ -f "$output" ]; then
        # Calcular reducción de tamaño
        orig_size=$(stat -f%z "$img" 2>/dev/null)
        new_size=$(stat -f%z "$output" 2>/dev/null)
        
        if [ -n "$orig_size" ] && [ -n "$new_size" ] && [ "$orig_size" -gt 0 ]; then
            reduction=$((100 - (new_size * 100 / orig_size)))
            echo "  ✅ Convertido: $(($orig_size/1024))KB → $(($new_size/1024))KB (-$reduction%)"
        else
            echo "  ✅ Convertido: $img → $output"
        fi
        converted=$((converted + 1))
    else
        echo "  ❌ Error al convertir: $img"
        failed=$((failed + 1))
    fi
    
    echo ""
done

echo "=== Resumen ==="
echo "Total de imágenes encontradas: ${#IMAGES_EXIST[@]}"
echo "Convertidas exitosamente: $converted"
echo "Fallos: $failed"
echo ""
echo "Nota: Si no tienes herramientas de conversión, puedes:"
echo "1. Instalar ImageMagick: brew install imagemagick"
echo "2. Usar una herramienta online para convertir imágenes"
echo "3. Las referencias en el código ya están actualizadas a .webp"
echo "   Solo necesitas crear los archivos .webp correspondientes"