import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, ArrowRight } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Detect active section
      const sections = ['hero', 'about', 'services', 'projects', 'coverage', 'upcoming-projects', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Inicio', href: '#hero', id: 'hero' },
    { name: 'Nosotros', href: '#about', id: 'about' },
    { name: 'Servicios', href: '#services', id: 'services' },
    { name: 'Proyectos', href: '#projects', id: 'projects' },
    { name: 'Cobertura', href: '#coverage', id: 'coverage' },
    { name: 'Por Ejecutar', href: '#upcoming-projects', id: 'upcoming-projects' },
    { name: 'Contacto', href: '#contact', id: 'contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navigation */}
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? 'py-3'
            : 'py-6'
        }`}
      >
        {/* Background with glassmorphism */}
        <div className={`absolute inset-0 transition-all duration-700 ${
          isScrolled 
            ? 'glass opacity-100' 
            : 'bg-transparent opacity-0'
        }`}>
          <div className="absolute inset-0 border-b border-white/5" />
        </div>

        <div className="relative w-full px-6 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Logo - Using Image */}
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#hero');
              }}
              className="flex items-center group relative z-10"
            >
              <img 
                src="/logo-full-gris (1).png" 
                alt="García Construcciones 503" 
                className="h-10 sm:h-12 w-auto object-contain transition-all duration-500 group-hover:scale-105 brightness-100 group-hover:brightness-110"
              />
            </a>

            {/* Desktop Navigation - Redesigned */}
            <div className="hidden lg:flex items-center gap-2 bg-dark-50/50 backdrop-blur-sm rounded-full px-3 py-2 border border-white/5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-500 ${
                    activeSection === link.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {/* Active indicator */}
                  {activeSection === link.id && (
                    <span className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full shadow-glow animate-in" />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </a>
              ))}
            </div>

            {/* CTA Section - Redesigned */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Phone */}
              <a
                href="tel:+582934322054"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-dark-50/50 backdrop-blur-sm border border-white/5 hover:border-brand-500/50 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                  <Phone className="w-4 h-4 text-brand-400" />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  +58 293 432 2054
                </span>
              </a>

              {/* CTA Button */}
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#contact');
                }}
                className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold overflow-hidden transition-all duration-300 hover:shadow-glow-lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Cotizar Proyecto
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </div>

            {/* Mobile Menu Button - Redesigned */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-10 h-10 rounded-xl bg-dark-50/50 backdrop-blur-sm border border-white/5 flex items-center justify-center text-white hover:border-brand-500/50 transition-all duration-300"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 top-1 w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-2' : ''}`} />
                <span className={`absolute left-0 top-2 w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`absolute left-0 top-3 w-5 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Completely Redesigned */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="px-6 pt-24 pb-8">
            <div className="flex items-center gap-3 mb-2">
              <img 
                src="/logo-full-gris (1).png" 
                alt="García Construcciones 503" 
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Construyendo el futuro de Venezuela
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-6 overflow-y-auto">
            <div className="space-y-2">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={`group flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${
                    activeSection === link.id
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-glow'
                      : 'bg-dark-50/30 hover:bg-dark-50/50'
                  }`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    opacity: isMobileMenuOpen ? 1 : 0,
                    transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `all 0.5s ease ${index * 0.1}s`
                  }}
                >
                  <span className={`text-lg font-semibold ${
                    activeSection === link.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {link.name}
                  </span>
                  <ArrowRight className={`w-5 h-5 transform transition-all duration-300 ${
                    activeSection === link.id 
                      ? 'text-white translate-x-0' 
                      : 'text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                  }`} />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Contact Info */}
          <div className="px-6 py-8 space-y-4 border-t border-white/5">
            {/* Phone */}
            <a
              href="tel:+582934322054"
              className="flex items-center gap-3 p-4 rounded-xl bg-dark-50/30 hover:bg-dark-50/50 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                <Phone className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Llámanos</p>
                <p className="text-white font-medium">+58 293 432 2054</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:garciaconstrucciones503.c.a@gmail.com"
              className="flex items-center gap-3 p-4 rounded-xl bg-dark-50/30 hover:bg-dark-50/50 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                <Mail className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-white font-medium text-sm">garciaconstrucciones503.c.a@gmail.com</p>
              </div>
            </a>

            {/* CTA Button */}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#contact');
              }}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300"
            >
              Solicitar Cotización
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
