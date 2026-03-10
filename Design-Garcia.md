# García Construcciones 503, C.A. - Website Design

## Overview
- **Motion Style**: Architectural Fluidity & Structural Precision
- **Animation Intensity**: Ultra-Dynamic
- **Technology Stack**: React, GSAP (ScrollTrigger), Tailwind CSS, shadcn/ui

## Brand Foundation
- **Colors**: 
  - Primary Brand: #2d3572
  - Brand Light: #475099
  - Brand Lighter: #5d68b8
  - Primary Dark: #0a0a0a
  - Secondary Dark: #141414
  - Light Cream: #f5f5f0
  - White: #ffffff
  - Gray: #6b7280
- **Typography**: 
  - Headings: "Inter" (Weights: 300, 400, 500, 600, 700, 800)
  - Body: "Inter" (Weights: 300, 400, 500)
- **Core Message**: Construyendo el futuro de Venezuela con excelencia y compromiso.
- **Font Family**: Inter (Google Fonts)

## Global Motion System

### Animation Timing
- **Easing Library**: 
  - Smooth: `cubic-bezier(0.4, 0, 0.2, 1)`
  - Bounce: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`
  - Precision: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Duration Scale**: 0.6s base, 1.2s for complex animations
- **Stagger Patterns**: 0.08s per item

### Continuous Effects
- **Living Textures**: Subtle noise overlay (opacity 0.02) on dark backgrounds
- **Ambient Motion**: Floating elements with sine wave patterns

### Scroll Engine
- **Physics**: Smooth scrolling with GSAP ScrollTrigger
- **Parallax**: Multi-layer depth system (background 0.3x, content 1x, accents 1.2x)

## Section 1: Hero

### Layout
**The "Architectural Vision" Layout**
A full-screen immersive experience with a dramatic background image, overlaid with bold typography and animated statistics. The layout features a diagonal split composition.

#### Spatial Composition
- **Layer 1**: Full-screen construction/architecture background image
- **Layer 2**: Dark gradient overlay with subtle texture
- **Layer 3**: Centered content with large typography
- **Layer 4**: Floating statistics cards at the bottom

### Content
- **H1**: "Construyendo el Futuro de Venezuela"
- **Subtitle**: "Más de una década de experiencia en obras civiles, infraestructura eléctrica y espacios institucionales"
- **CTA**: "Ver Proyectos"
- **Stats**: "10+ Años", "50+ Proyectos", "6+ Estados"

### Images
**Hero Background**
- **Resolution**: 1920x1080
- **Aspect Ratio**: 16:9
- **Transparent Background**: No
- **Visual Style**: Dramatic construction site photography
- **Subject**: Modern construction site, workers, machinery
- **Color Palette**: Warm oranges, deep blacks, construction yellows
- **Generation Prompt**: "Wide-angle shot of modern construction site at golden hour, dramatic lighting, construction cranes and steel structures, professional photography, cinematic composition, warm orange and yellow tones against deep blue sky"

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Background | Scale & Fade | Scale: 1.1→1, Opacity: 0→1 | 1.5s | 0s | Smooth |
| H1 | Split Word Reveal | Y: 80px→0, Opacity: 0→1 | 1s | 0.3s | Precision |
| Subtitle | Fade Up | Y: 30px→0, Opacity: 0→1 | 0.8s | 0.6s | Smooth |
| CTA | Scale In | Scale: 0.8→1, Opacity: 0→1 | 0.6s | 0.9s | Bounce |
| Stats | Stagger Up | Y: 50px→0, Opacity: 0→1 | 0.6s | 1.1s | Smooth |

#### Scroll Effects
| Trigger | Element | Effect | Start | End | Values |
|---------|---------|--------|-------|-----|--------|
| Scroll | Background | Parallax Y | Top | Bottom | Y: 0 → 30% |
| Scroll | Content | Parallax Y | Top | Bottom | Y: 0 → -20% |

## Section 2: About

### Layout
**The "Story Timeline" Layout**
A split-screen layout with image on one side and content on the other, featuring a vertical timeline of company milestones.

#### Spatial Composition
- **Left Column**: Large image with overlay statistics
- **Right Column**: Company story with animated text
- **Timeline**: Vertical line with milestone markers

### Content
- **H2**: "Nuestra Historia"
- **Body**: "García Construcciones 503 C.A. nació formalmente el 2 de marzo del año 2015, pero su verdadero origen se remonta mucho antes, cuando la visión y el esfuerzo constante de su fundador, Abelardo Ignacio García Vera, comenzaron a trazar el camino de lo que hoy se ha consolidado como una empresa referente en el sector de la construcción en Venezuela."
- **Quote**: "Construir no es solo levantar estructuras, sino crear espacios dignos, funcionales y sostenibles que mejoren la calidad de vida de las personas."
- **CTA**: "Conoce más sobre nosotros"

### Images
**About Image**
- **Resolution**: 800x1000
- **Aspect Ratio**: 4:5
- **Transparent Background**: No
- **Visual Style**: Corporate construction photography
- **Subject**: Construction team, workers in safety gear
- **Color Palette**: Orange safety vests, construction equipment
- **Generation Prompt**: "Professional photo of construction team at work site, workers in orange safety vests and helmets, modern building under construction in background, golden hour lighting, documentary style photography"

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Image | Slide & Reveal | X: -100px→0, Clip-path reveal | 1s | 0s | Precision |
| H2 | Mask Reveal | Clip-path: 0%→100% | 0.8s | 0.2s | Precision |
| Body | Fade Up | Y: 30px→0, Opacity: 0→1 | 0.8s | 0.4s | Smooth |
| Quote | Scale & Fade | Scale: 0.95→1, Opacity: 0→1 | 0.8s | 0.6s | Smooth |

## Section 3: Services

### Layout
**The "Horizontal Scroll Cards" Layout**
A horizontal scrolling section with service cards that expand on hover, each featuring an icon, title, and description.

#### Spatial Composition
- **Container**: Full-width horizontal scroll track
- **Cards**: Large cards with images and overlays
- **Categories**: 4 main service categories

### Content
- **H2**: "Nuestros Servicios"
- **Subtitle**: "Soluciones integrales para cada tipo de proyecto"

**Service Categories:**
1. **Infraestructura Eléctrica** (40%)
   - Sedes CORPOELEC
   - Subestaciones
   - Mantenimiento eléctrico
   
2. **Espacios Institucionales** (25%)
   - Oficinas administrativas
   - Talleres de reparación
   - Centros de operaciones
   
3. **Infraestructura Educativa** (20%)
   - Universidades
   - Centros de formación
   - Adecuación de espacios
   
4. **Rehabilitación Urbana** (15%)
   - Centros nutricionales
   - Comedores institucionales
   - Recuperación de espacios

### Images
**Service Images**
- **Resolution**: 600x400
- **Aspect Ratio**: 3:2
- **Transparent Background**: No
- **Visual Style**: Professional construction photography
- **Subject**: Each service category represented
- **Color Palette**: Consistent with brand colors

### Motion Choreography

#### Scroll Effects
| Trigger | Element | Effect | Start | End | Values |
|---------|---------|--------|-------|-----|--------|
| Scroll | Cards | Horizontal Move | Top | Bottom | X: 0 → -100% |

#### Interaction Effects
- **Card Hover**: Card expands (scale 1.05), overlay lightens, content slides up

## Section 4: Projects Gallery

### Layout
**The "Masonry Filterable Gallery" Layout**
A filterable masonry grid showcasing all completed projects with category filters and lightbox functionality.

#### Spatial Composition
- **Filter Bar**: Horizontal category filters at top
- **Grid**: Masonry layout with varying card sizes
- **Cards**: Image with overlay showing project info

### Content
- **H2**: "Proyectos Ejecutados"
- **Subtitle**: "Más de 50 obras completadas con éxito"
- **Filters**: "Todos", "Infraestructura Eléctrica", "Institucional", "Educativo", "Rehabilitación"

**Featured Projects:**
1. Edificio Sede CORPOELEC Cumaná
2. Edificio Sede CORPOELEC Araya
3. Subestación Manzanares 115/13.8 KV
4. Subestación Araya 34.5/13.8 KV
5. Subestación Móvil El Peñón
6. Subestación Casanay 230/115 KV
7. UNEXEE Núcleo Falcón
8. Centro Nutricional FUNSASEN El Furrial
9. Centro de Alimentación Guanta
10. Taller de Reparación de Transformadores Chacao

### Images
**Project Images**
- **Resolution**: 800x600
- **Aspect Ratio**: 4:3
- **Transparent Background**: No
- **Visual Style**: Before/after comparison or completed project
- **Subject**: Each project site
- **Color Palette**: Documentary style

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Grid Items | Stagger Fade | Scale: 0.9→1, Opacity: 0→1 | 0.5s | Stagger 0.05s | Smooth |

#### Interaction Effects
- **Filter Click**: Grid reshuffles with animation
- **Card Hover**: Image zooms, overlay appears with project info
- **Card Click**: Opens lightbox with full project details

## Section 5: Coverage Map

### Layout
**The "Interactive Venezuela Map" Layout**
A visual representation of the company's presence across Venezuela with animated statistics.

#### Spatial Composition
- **Map**: Stylized Venezuela map with marked locations
- **Stats**: Counter animations for each state
- **List**: State-by-state project breakdown

### Content
- **H2**: "Alcance y Cobertura"
- **Subtitle**: "Presencia en más de 6 estados del país"

**States:**
- **Sucre**: Sede principal + obras eléctricas e institucionales (8+ proyectos)
- **Falcón**: Recuperación educativa (Universidad) (3+ proyectos)
- **Monagas**: Centro nutricional (1+ proyecto)
- **Anzoátegui**: Planta alimentaria (2+ proyectos)
- **Caracas**: Obras institucionales (6+ proyectos)
- **Miranda**: Obras institucionales (2+ proyectos)

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Map | Draw SVG | Stroke-dashoffset animation | 2s | 0s | Smooth |
| Markers | Pop In | Scale: 0→1 | 0.4s | Stagger 0.2s | Bounce |
| Counters | Count Up | 0→final value | 2s | 0.5s | Smooth |

## Section 6: Fleet

### Layout
**The "Equipment Showcase" Layout**
A horizontal slider showcasing the company's fleet and machinery.

#### Spatial Composition
- **Slider**: Horizontal scroll with vehicle cards
- **Cards**: Image with specifications
- **Navigation**: Arrow buttons and dots

### Content
- **H2**: "Nuestra Flota Vehicular"
- **Subtitle**: "Equipos y maquinaria que respaldan nuestra capacidad técnica"

**Fleet Items:**
- Cargo 1721 Pitma (Plataforma/Hidráulica)
- NPR Plataforma
- Iveco 4012/Daily (Plataforma)
- Iveco 6012/Daily (Plataforma)
- Hino EXZ (Volqueta)
- Super Duty (Plataforma)
- F-150 Pickup (Plataforma/Baranda)
- Cheyenne (Plataforma/Baranda)
- Hilux 4x4 Pick-up
- KLR 650 / KLR (Moto)
- Horse KW-150 (Moto)
- Caterpillar 420E (Retroexcavadora)
- John Deere 310SE (Retroexcavadora)
- Montacarga GP25ZNT
- Mini-cargador CASE

### Images
**Fleet Images**
- **Resolution**: 600x400
- **Aspect Ratio**: 3:2
- **Transparent Background**: No
- **Visual Style**: Product photography
- **Subject**: Each vehicle/machine
- **Color Palette**: Industrial colors

## Section 7: Contact

### Layout
**The "Split Contact" Layout**
A two-column layout with contact information on the left and a form on the right.

#### Spatial Composition
- **Left Column**: Contact info, address, map
- **Right Column**: Contact form
- **Background**: Subtle pattern or image

### Content
- **H2**: "Contáctanos"
- **Subtitle**: "Conversemos sobre tu próximo proyecto"

**Contact Info:**
- **Address**: Av. Bermúdez, sector Puerto Sucre, Edif. Ignacio García N°118, piso 1. Cumaná, estado Sucre.
- **Phone**: +58 293 432 2054 / +58 414 802 0966
- **Email**: garciaconstrucciones503.c.a@gmail.com
- **Representante Legal**: Abelardo I. García Vera

**Form Fields:**
- Nombre
- Email
- Teléfono
- Tipo de Proyecto
- Mensaje

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Info Cards | Slide In | X: -50px→0, Opacity: 0→1 | 0.6s | Stagger 0.1s | Smooth |
| Form | Slide In | X: 50px→0, Opacity: 0→1 | 0.6s | 0.3s | Smooth |

## Section 8: Footer

### Layout
**The "Clean Footer" Layout**
A minimalist footer with logo, navigation, and social links.

#### Spatial Composition
- **Logo**: Large brand mark
- **Navigation**: Quick links
- **Social**: Social media icons
- **Legal**: Copyright and legal links

### Content
- **Logo**: García Construcciones 503
- **Tagline**: "Construyendo el futuro de Venezuela"
- **Links**: Inicio, Proyectos, Servicios, Nosotros, Contacto
- **Social**: Facebook, Twitter/X, Instagram, LinkedIn
- **Copyright**: © 2025 García Construcciones 503, C.A.

## Technical Implementation Notes

### Required Libraries
- **GSAP**: Core animation engine (ScrollTrigger)
- **React**: Component framework
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **Lucide React**: Icons

### Critical Performance Rules
- ✅ **Compositor Only**: Animate `transform` and `opacity` only
- ✅ **Lazy Loading**: Images load on scroll
- ✅ **Will-change**: Use sparingly on animated elements

### Browser Support
- **Progressive Enhancement**: Fallback for older browsers
- **Reduced Motion**: Respect `prefers-reduced-motion`

## Output Path
`/mnt/okcomputer/output/design.md`
