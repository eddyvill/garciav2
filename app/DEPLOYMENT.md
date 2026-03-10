# 🚀 Guía de Deployment - García Construcciones 503

## Pre-requisitos

Antes de hacer deploy, asegúrate de:

1. ✅ Todas las imágenes están en `/public`
2. ✅ El formulario de contacto está configurado
3. ✅ Las variables de entorno están configuradas
4. ✅ El build funciona correctamente: `npm run build`
5. ✅ El preview funciona: `npm run preview`

## 🌐 Opciones de Hosting

### 1. Vercel (Recomendado)

#### Ventajas
- Deploy automático desde Git
- CDN global
- SSL gratis
- Optimización automática
- Analytics incluido

#### Pasos
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd app
vercel

# Deploy a producción
vercel --prod
```

#### Configuración
Crear `vercel.json` en `/app`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2. Netlify

#### Pasos
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
cd app
netlify deploy

# Deploy a producción
netlify deploy --prod
```

#### Configuración
Crear `netlify.toml` en `/app`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

#### Pasos
1. Instalar gh-pages:
```bash
cd app
npm install --save-dev gh-pages
```

2. Agregar scripts en `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Configurar base en `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/nombre-repo/',
  // ... resto de config
})
```

4. Deploy:
```bash
npm run deploy
```

### 4. Cloudflare Pages

#### Pasos
1. Conectar repositorio en Cloudflare Pages
2. Configurar build:
   - Build command: `npm run build`
   - Build output: `dist`
   - Root directory: `app`

### 5. AWS S3 + CloudFront

#### Pasos
```bash
# Build
npm run build

# Subir a S3
aws s3 sync dist/ s3://tu-bucket --delete

# Invalidar CloudFront cache
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

## 📝 Checklist Pre-Deploy

### Contenido
- [ ] Todas las imágenes optimizadas (WebP)
- [ ] Textos revisados y sin errores
- [ ] Links funcionando correctamente
- [ ] Información de contacto actualizada
- [ ] Proyectos con datos reales

### SEO
- [ ] Meta tags configurados
- [ ] Open Graph tags
- [ ] Twitter Cards
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Favicon configurado

### Performance
- [ ] Imágenes optimizadas
- [ ] Lazy loading implementado
- [ ] Bundle size optimizado
- [ ] Lighthouse score > 90

### Funcionalidad
- [ ] Formulario de contacto funcional
- [ ] Navegación funcionando
- [ ] Responsive en todos los dispositivos
- [ ] Cross-browser testing

### Analytics
- [ ] Google Analytics configurado
- [ ] Facebook Pixel (opcional)
- [ ] Hotjar o similar (opcional)

## 🔧 Configuración de Variables de Entorno

Crear `.env.production` en `/app`:

```env
# API Endpoints
VITE_API_URL=https://api.garciaconstrucciones503.com

# Email Service (ejemplo: EmailJS)
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Otros
VITE_SITE_URL=https://garciaconstrucciones503.com
```

## 📊 Optimizaciones Pre-Deploy

### 1. Optimizar Imágenes

```bash
# Instalar herramientas
npm install -g sharp-cli

# Convertir a WebP
sharp -i public/*.jpg -o public/ -f webp

# Optimizar JPG
sharp -i public/*.jpg -o public/ --quality 85
```

### 2. Analizar Bundle

```bash
# Instalar plugin
npm install --save-dev rollup-plugin-visualizer

# Agregar a vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
})

# Build y ver análisis
npm run build
```

### 3. Lighthouse Audit

```bash
# Instalar Lighthouse
npm install -g lighthouse

# Correr audit
lighthouse https://tu-sitio.com --view
```

## 🔒 Seguridad

### Headers de Seguridad

Para Netlify (`netlify.toml`):
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

Para Vercel (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 📱 PWA (Opcional)

### Instalar Vite PWA Plugin

```bash
npm install -D vite-plugin-pwa
```

### Configurar en `vite.config.ts`

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'García Construcciones 503',
        short_name: 'García 503',
        description: 'Construyendo el futuro de Venezuela',
        theme_color: '#2d3572',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

## 🔍 SEO Setup

### Meta Tags en `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary Meta Tags -->
  <title>García Construcciones 503 | Construyendo el Futuro de Venezuela</title>
  <meta name="title" content="García Construcciones 503 | Construyendo el Futuro de Venezuela">
  <meta name="description" content="Más de una década de experiencia en obras civiles, infraestructura eléctrica y espacios institucionales en Venezuela.">
  <meta name="keywords" content="construcción, infraestructura, Venezuela, obras civiles, CORPOELEC">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://garciaconstrucciones503.com/">
  <meta property="og:title" content="García Construcciones 503 | Construyendo el Futuro de Venezuela">
  <meta property="og:description" content="Más de una década de experiencia en obras civiles, infraestructura eléctrica y espacios institucionales.">
  <meta property="og:image" content="https://garciaconstrucciones503.com/og-image.jpg">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://garciaconstrucciones503.com/">
  <meta property="twitter:title" content="García Construcciones 503">
  <meta property="twitter:description" content="Construyendo el futuro de Venezuela">
  <meta property="twitter:image" content="https://garciaconstrucciones503.com/og-image.jpg">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</head>
```

### Crear `public/robots.txt`

```txt
User-agent: *
Allow: /

Sitemap: https://garciaconstrucciones503.com/sitemap.xml
```

### Crear `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://garciaconstrucciones503.com/</loc>
    <lastmod>2026-03-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

## 📈 Analytics Setup

### Google Analytics 4

Agregar en `index.html` antes de `</head>`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🧪 Testing Pre-Deploy

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile Large (414x896)

### Performance Testing
```bash
# Lighthouse
lighthouse https://tu-sitio.com

# WebPageTest
# Usar https://www.webpagetest.org/
```

## 🚀 Deploy Final

### Comando de Deploy
```bash
# Build
npm run build

# Test build localmente
npm run preview

# Deploy (ejemplo con Vercel)
vercel --prod
```

### Post-Deploy Checklist
- [ ] Sitio accesible en dominio
- [ ] SSL funcionando (HTTPS)
- [ ] Todas las páginas cargan
- [ ] Formulario funciona
- [ ] Analytics funcionando
- [ ] Performance > 90 en Lighthouse
- [ ] SEO > 90 en Lighthouse
- [ ] Accesibilidad > 90 en Lighthouse

## 🔄 CI/CD (Opcional)

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd app
          npm ci
          
      - name: Build
        run: |
          cd app
          npm run build
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./app
```

## 📞 Soporte Post-Deploy

### Monitoreo
- Configurar alertas de uptime (UptimeRobot, Pingdom)
- Monitorear errores (Sentry)
- Revisar analytics semanalmente

### Mantenimiento
- Actualizar dependencias mensualmente
- Revisar performance trimestralmente
- Backup de contenido regularmente

---

**¡Listo para producción!** 🎉
