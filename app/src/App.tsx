import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sun, Moon } from 'lucide-react';
import { Toaster } from 'sonner';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useTheme } from './hooks/useTheme';
import { AuthProvider } from './gestion/context/AuthContext';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Services from './sections/Services';
import Projects from './sections/Projects';
import Coverage from './sections/Coverage';
import Clients from './sections/Clients';
import UpcomingProjects from './sections/UpcomingProjects';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

const GestionApp = lazy(() => import('./gestion/GestionApp'));
const LoginPage = lazy(() => import('./gestion/pages/LoginPage'));

function LandingPage() {
  useSmoothScroll();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    ScrollTrigger.refresh();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.globalTimeline.timeScale(0);
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-dark overflow-x-hidden">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-lg hover:shadow-glow transition-all duration-300"
        aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main>
        <Hero />
        <About />
        <Services />
        <Projects />
        <Coverage />
        <Clients />
        <UpcomingProjects />
        <Contact />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            background: 'rgba(30, 30, 30, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark text-white">Cargando...</div>}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/gestion/*"
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark text-white">Cargando...</div>}>
              <GestionApp />
            </Suspense>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
