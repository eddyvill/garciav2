# Guía Rápida - García Construcciones 503

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🎨 Uso del Nuevo Color de Marca

### En Tailwind Classes
```tsx
// Backgrounds
<div className="bg-brand-500">        // Color principal
<div className="bg-brand-400">        // Más claro
<div className="bg-brand-600">        // Más oscuro

// Text
<span className="text-brand-500">     // Texto color marca
<span className="text-brand-300">     // Texto más claro

// Borders
<div className="border-brand-500">    // Borde color marca

// Gradients
<div className="from-brand-500 to-brand-700">  // Gradiente
```

### Gradient Text Animado
```tsx
<h1 className="gradient-text">
  Texto con Gradiente Animado
</h1>
```

## ✨ Componentes Nuevos

### Custom Cursor
Ya está implementado globalmente en `App.tsx`. No requiere configuración adicional.

### Magnetic Button
```tsx
import MagneticButton from '@/components/MagneticButton';

<MagneticButton 
  className="bg-brand-500 text-white px-8 py-4 rounded-xl"
  onClick={() => console.log('Clicked!')}
  strength={0.3}  // Opcional: intensidad del efecto (default: 0.3)
>
  Botón Magnético
</MagneticButton>
```

### Counter Animation
```tsx
import CounterAnimation from '@/components/CounterAnimation';

<CounterAnimation 
  end={50}           // Número final
  duration={2}       // Duración en segundos (opcional)
  suffix="+"         // Sufijo (opcional)
  className="text-4xl font-bold text-brand-500"
/>
```

## 🎭 Efectos CSS Disponibles

### Glassmorphism
```tsx
<div className="glass">
  Contenido con efecto glass
</div>

<div className="glass-light">
  Glass con tinte de marca
</div>
```

### Button Shine
```tsx
<button className="btn-shine bg-brand-500">
  Botón con efecto shine al hover
</button>
```

### Card Hover
```tsx
<div className="card-hover">
  Tarjeta con elevación al hover
</div>
```

### Glow Pulse
```tsx
<div className="glow-pulse">
  Elemento con pulso de brillo
</div>
```

### Float Animation
```tsx
<div className="float-slow">
  Elemento flotante
</div>
```

## 🎨 Clases de Animación

### Fade In
```tsx
<div className="animate-fade-in">Fade in</div>
<div className="animate-fade-in-up">Fade in desde abajo</div>
```

### Scale In
```tsx
<div className="animate-scale-in">Scale in</div>
```

### Slide In
```tsx
<div className="animate-slide-in-left">Slide desde izquierda</div>
<div className="animate-slide-in-right">Slide desde derecha</div>
```

### Float
```tsx
<div className="animate-float">Flotación continua</div>
```

### Shimmer
```tsx
<div className="shimmer">Efecto shimmer</div>
```

## 🎯 Animaciones GSAP

### Básica con ScrollTrigger
```tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MyComponent = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: elementRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return <div ref={elementRef}>Contenido animado</div>;
};
```

### Parallax Effect
```tsx
gsap.to(elementRef.current, {
  yPercent: 30,
  ease: 'none',
  scrollTrigger: {
    trigger: containerRef.current,
    start: 'top top',
    end: 'bottom top',
    scrub: 1,  // Smooth parallax
  },
});
```

### Stagger Animation
```tsx
gsap.fromTo(
  containerRef.current?.querySelectorAll('.item') || [],
  { y: 40, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,  // Delay entre elementos
    ease: 'power3.out',
  }
);
```

## 🎨 Gradientes Personalizados

### Background Gradients
```tsx
// Gradiente de marca
<div className="bg-gradient-to-r from-brand-500 to-brand-700">

// Gradiente con transparencia
<div className="bg-gradient-to-t from-dark via-transparent to-dark/60">

// Gradiente radial (CSS inline)
<div style={{ 
  background: 'radial-gradient(circle, rgba(45,53,114,0.1) 0%, transparent 70%)'
}}>
```

## 🔧 Configuración de Smooth Scroll

El smooth scroll ya está configurado globalmente con Lenis. Para deshabilitarlo en elementos específicos:

```tsx
<div data-lenis-prevent>
  Contenido sin smooth scroll
</div>
```

## 📱 Responsive Utilities

### Breakpoints
```tsx
// Mobile first
<div className="text-sm md:text-base lg:text-lg xl:text-xl">

// Hide on mobile
<div className="hidden md:block">

// Show only on mobile
<div className="block md:hidden">
```

## ♿ Accesibilidad

### Focus States
```tsx
// Focus visible automático
<button className="focus-visible:outline-brand-500">
  Botón accesible
</button>
```

### Reduced Motion
Las animaciones se desactivan automáticamente si el usuario tiene `prefers-reduced-motion` activado.

## 🎨 Sombras con Glow

```tsx
// Sombra normal
<div className="shadow-glow">

// Sombra grande
<div className="shadow-glow-lg">

// Sombra extra grande
<div className="shadow-glow-xl">
```

## 🔍 Tips de Performance

### Will-change
```tsx
// Para elementos que se van a animar
<div className="will-change-transform">

<div className="will-change-opacity">
```

### GPU Acceleration
```tsx
<div className="gpu-accelerated">
  Elemento acelerado por GPU
</div>
```

## 📦 Estructura de Archivos

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── CustomCursor.tsx # Cursor personalizado
│   ├── MagneticButton.tsx
│   └── CounterAnimation.tsx
├── hooks/
│   ├── useSmoothScroll.ts
│   └── use-mobile.ts
├── sections/
│   ├── Navigation.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Services.tsx
│   ├── Projects.tsx
│   ├── Coverage.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── lib/
│   └── utils.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## 🎯 Próximos Pasos

1. Agregar imágenes reales en `/public`
2. Configurar formulario de contacto
3. Optimizar imágenes (WebP, lazy loading)
4. Agregar meta tags SEO
5. Configurar analytics
6. Testing en diferentes navegadores
7. Optimización de performance
8. Deploy a producción

## 📞 Soporte

Para dudas o problemas:
1. Revisar la documentación de GSAP: https://gsap.com/docs/
2. Revisar Tailwind CSS: https://tailwindcss.com/docs
3. Revisar shadcn/ui: https://ui.shadcn.com/

---

**Última actualización**: Marzo 2026
