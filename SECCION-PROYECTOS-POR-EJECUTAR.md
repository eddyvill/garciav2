# 🚀 Nueva Sección: Proyectos por Ejecutar

**Fecha**: Marzo 4, 2026  
**Estado**: ✅ Completado

---

## 🎯 Descripción

Nueva sección que muestra los proyectos futuros y en planificación de García Construcciones 503, ubicada antes de la sección de contacto.

---

## 📐 Diseño y Layout

### Grid de 3 Columnas
```
┌────────┐  ┌────────┐  ┌────────┐
│Proyecto│  │Proyecto│  │Proyecto│
│   1    │  │   2    │  │   3    │
└────────┘  └────────┘  └────────┘
```

**Responsive:**
- Desktop: 3 columnas
- Tablet: 2 columnas
- Móvil: 1 columna

---

## 🎨 Características de las Tarjetas

### Estructura de Cada Tarjeta

**1. Imagen Superior (256px altura)**
- Imagen de stock de Unsplash
- Overlay con gradiente oscuro
- Zoom en hover (scale 110%)
- Overlay de color brand en hover

**2. Badges en la Imagen**
- **Status Badge** (top-left):
  - 🟢 "Próximamente" (verde)
  - 🔵 "Aprobado" (azul)
  - 🟡 "En Planificación" (amarillo)
  
- **Category Badge** (top-right):
  - Categoría del proyecto
  - Fondo oscuro con blur

**3. Contenido (Padding 24px)**
- Título (20px, bold, 2 líneas máx)
- Descripción (14px, 2 líneas máx)
- Info Grid con iconos:
  - 📍 Ubicación
  - 📅 Inicio estimado
  - 📈 Presupuesto
- CTA "Más información" con flecha

---

## 🎭 Animaciones Únicas

### Entrada desde Abajo con Rotación
```javascript
gsap.fromTo(cards, 
  { 
    y: 100,           // Desde abajo
    opacity: 0,       // Invisible
    rotateX: -15,     // Rotación 3D
    scale: 0.9        // Escala reducida
  },
  {
    y: 0,
    opacity: 1,
    rotateX: 0,
    scale: 1,
    stagger: 0.15,    // Efecto cascada
    ease: 'back.out'  // Rebote suave
  }
);
```

**Diferencias con Projects:**
- Projects: Fade + slide simple
- Upcoming: Rotación 3D + scale + bounce

### Hover Effects
- Elevación: `translateY(-8px)`
- Borde animado con pulse
- Imagen con zoom
- Overlay de color brand
- Gap animado en CTA

---

## 📊 Proyectos de Ejemplo

### 1. Centro Comercial Plaza Norte
- **Categoría**: Infraestructura Comercial
- **Ubicación**: Caracas, Edo. Miranda
- **Inicio**: Q2 2026
- **Presupuesto**: $2.5M
- **Status**: Aprobado
- **Imagen**: Edificio comercial moderno

### 2. Complejo Residencial Vista Mar
- **Categoría**: Residencial
- **Ubicación**: Puerto La Cruz, Edo. Anzoátegui
- **Inicio**: Q3 2026
- **Presupuesto**: $4.2M
- **Status**: En Planificación
- **Imagen**: Edificio residencial

### 3. Hospital Regional del Este
- **Categoría**: Salud
- **Ubicación**: Maturín, Edo. Monagas
- **Inicio**: Q1 2026
- **Presupuesto**: $8.5M
- **Status**: Próximamente
- **Imagen**: Hospital moderno

---

## 🎨 Paleta de Colores por Status

### Próximamente (Verde)
```css
bg-green-500/20
text-green-400
border-green-500/30
```

### Aprobado (Azul)
```css
bg-blue-500/20
text-blue-400
border-blue-500/30
```

### En Planificación (Amarillo)
```css
bg-yellow-500/20
text-yellow-400
border-yellow-500/30
```

---

## 📝 Estructura del Código

### Interface
```typescript
interface UpcomingProject {
  id: number;
  title: string;
  category: string;
  location: string;
  estimatedStart: string;
  budget: string;
  description: string;
  image: string;
  status: 'planning' | 'approved' | 'starting-soon';
}
```

### Componentes Clave
1. **Header Section**: Título y descripción
2. **Cards Grid**: Grid responsive de tarjetas
3. **Project Card**: Tarjeta individual con hover
4. **CTA Section**: Llamado a acción final

---

## 🖼️ Imágenes de Stock (Unsplash)

Las imágenes actuales son placeholders de Unsplash:

1. **Centro Comercial**: 
   - URL: `photo-1486406146926-c627a92ad1ab`
   - Tema: Edificio comercial moderno

2. **Residencial**:
   - URL: `photo-1545324418-cc1a3fa10c00`
   - Tema: Edificio residencial

3. **Hospital**:
   - URL: `photo-1519494026892-80bbd2d6fd0d`
   - Tema: Hospital moderno

**Para reemplazar:**
1. Agrega tus imágenes en `/app/public/`
2. Actualiza las URLs en el array `upcomingProjects`
3. Formato recomendado: 800x600px, JPG

---

## 🎯 Ubicación en el Sitio

```
Hero
↓
About
↓
Services
↓
Projects (Ejecutados)
↓
Coverage
↓
🆕 Upcoming Projects (Por Ejecutar) ← NUEVA
↓
Contact
↓
Footer
```

---

## 🔗 Navegación

Se agregó un nuevo enlace en el menú:
- Desktop: "Por Ejecutar" en la barra de navegación
- Móvil: "Por Ejecutar" en el menú hamburguesa
- ID: `#upcoming-projects`

---

## 💡 Características Destacadas

### ✅ Diseño Moderno
- Grid de 3 columnas
- Tarjetas con elevación
- Imágenes grandes y atractivas

### ✅ Animaciones Únicas
- Entrada con rotación 3D
- Efecto de rebote (bounce)
- Stagger para efecto cascada
- Hover con elevación

### ✅ Información Clara
- Status visual con colores
- Iconos para cada dato
- Descripción concisa
- CTA visible

### ✅ Responsive
- 3 columnas en desktop
- 2 columnas en tablet
- 1 columna en móvil
- Siempre legible

---

## 🎨 Efectos Visuales

### Tarjeta Normal
- Borde gris sutil
- Sin elevación
- Imagen estática

### Tarjeta Hover
- Borde brand con glow
- Elevación -8px
- Imagen con zoom 110%
- Overlay brand 20%
- Borde animado con pulse
- CTA con gap aumentado

---

## 📊 Comparación con Projects

| Aspecto | Projects (Ejecutados) | Upcoming (Por Ejecutar) |
|---------|----------------------|-------------------------|
| **Layout** | Horizontal (imagen izq) | Vertical (imagen arriba) |
| **Columnas** | 1 (full width) | 3 (grid) |
| **Animación** | Fade + slide simple | Rotación 3D + bounce |
| **Info** | Completa con detalles | Resumida con estimados |
| **Status** | Completado | En proceso/futuro |
| **Hover** | Overlay + icon | Elevación + border |

---

## 🚀 Cómo Personalizar

### Agregar Nuevo Proyecto
```typescript
{
  id: 4,
  title: 'Tu Proyecto',
  category: 'Categoría',
  location: 'Ciudad, Estado',
  estimatedStart: 'Q4 2026',
  budget: '$X.XM',
  description: 'Descripción breve...',
  image: '/tu-imagen.jpg',
  status: 'planning', // o 'approved' o 'starting-soon'
}
```

### Cambiar Imágenes
1. Coloca tu imagen en `/app/public/`
2. Actualiza: `image: '/nombre-imagen.jpg'`

### Cambiar Colores de Status
Edita las funciones:
- `getStatusColor(status)`
- `getStatusText(status)`

---

## ✨ Resultado Final

Una sección moderna y atractiva que muestra los proyectos futuros de la empresa, con:

✅ Diseño de 3 columnas elegante  
✅ Animaciones únicas con rotación 3D  
✅ Status visual con colores  
✅ Información clara y concisa  
✅ Imágenes de stock listas para reemplazar  
✅ Totalmente responsive  
✅ Integrada en la navegación  

---

**La nueva sección "Proyectos por Ejecutar" está lista y muestra el futuro prometedor de García Construcciones 503.**
