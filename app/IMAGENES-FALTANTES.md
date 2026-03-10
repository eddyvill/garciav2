# 📸 Imágenes Faltantes para Proyectos

Para completar la sección de proyectos, necesitas agregar las siguientes imágenes en la carpeta `/app/public/`:

## Proyectos que Necesitan Imágenes Individuales

### 1. Subestación Manzanares
**Nombre del archivo**: `project-subestacion-manzanares.jpg`
- **Proyecto**: Subestación Manzanares 115/13.8 KV
- **Ubicación**: Cumaná, Edo. Sucre
- **Descripción**: Foto de la subestación Manzanares

### 2. Subestación Araya
**Nombre del archivo**: `project-subestacion-araya.jpg`
- **Proyecto**: Subestación Araya 34.5/13.8 KV
- **Ubicación**: Araya, Edo. Sucre
- **Descripción**: Foto de la subestación Araya

### 3. Centro Nutricional FUNSASEN
**Nombre del archivo**: `project-nutricional-funsasen.jpg`
- **Proyecto**: Centro Nutricional FUNSASEN El Furrial
- **Ubicación**: El Furrial, Edo. Monagas
- **Descripción**: Foto del centro nutricional FUNSASEN

### 4. Centro de Alimentación Guanta
**Nombre del archivo**: `project-alimentacion-guanta.jpg`
- **Proyecto**: Centro de Alimentación Guanta
- **Ubicación**: Guanta, Edo. Anzoátegui
- **Descripción**: Foto del centro de alimentación en Guanta

## Imágenes Existentes (Ya Configuradas)

✅ `project-corpoelec-cumana.jpg` - Edificio Sede CORPOELEC Cumaná
✅ `project-araya.jpg` - Edificio Sede CORPOELEC Araya
✅ `project-unexee.jpg` - UNEXEE Núcleo Falcón
✅ `project-taller.jpg` - Taller de Reparación de Transformadores

## Especificaciones de las Imágenes

### Formato Recomendado
- **Formato**: JPG o WebP
- **Resolución**: 800x600 px (mínimo)
- **Aspect Ratio**: 4:3
- **Tamaño**: < 500 KB por imagen
- **Calidad**: 85% (balance entre calidad y tamaño)

### Optimización
Para optimizar las imágenes antes de subirlas:

```bash
# Usando ImageMagick
convert imagen-original.jpg -resize 800x600^ -gravity center -extent 800x600 -quality 85 project-nombre.jpg

# Usando sharp-cli (Node.js)
sharp -i imagen-original.jpg -o project-nombre.jpg --resize 800 600 --quality 85
```

## Alternativa Temporal

Si no tienes las imágenes específicas ahora, puedes:

1. **Usar placeholders temporales**: Copia una de las imágenes existentes con los nuevos nombres
2. **Usar imágenes genéricas**: Busca imágenes de subestaciones eléctricas y centros de alimentación
3. **Generar con IA**: Usa herramientas como Midjourney o DALL-E para generar imágenes temporales

### Comando para crear placeholders temporales:
```bash
cd app/public
cp project-subestacion.jpg project-subestacion-manzanares.jpg
cp project-subestacion.jpg project-subestacion-araya.jpg
cp project-nutricional.jpg project-nutricional-funsasen.jpg
cp project-nutricional.jpg project-alimentacion-guanta.jpg
```

## Checklist de Imágenes

- [ ] project-subestacion-manzanares.jpg
- [ ] project-subestacion-araya.jpg
- [ ] project-nutricional-funsasen.jpg
- [ ] project-alimentacion-guanta.jpg

Una vez agregadas las imágenes, el sitio las mostrará automáticamente en la galería de proyectos.

---

**Nota**: El sitio funcionará con las imágenes actuales, pero mostrará las mismas fotos para proyectos similares hasta que agregues las imágenes específicas.
