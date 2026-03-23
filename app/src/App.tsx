import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sun, Moon } from 'lucide-react';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useTheme } from './hooks/useTheme';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Coverage from './sections/Coverage';
import Clients from './sections/Clients';
import UpcomingProjects from './sections/UpcomingProjects';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
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
    <div className="relative min-h-screen bg-dark">
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

export default App;
