import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const heroImages = [
  '/hero-bg.jpg',
  '/hero-bg2.jpg',
  '/hero-bg3.jpg',
];

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroImages.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroImages.length) % heroImages.length);
  }, [currentSlide, goToSlide]);

  // Auto-advance carousel
  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nextSlide]);

  // Reset interval on manual navigation
  const handleManualNav = (fn: () => void) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    fn();
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title words reveal animation
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.word');
        gsap.fromTo(
          words,
          { y: 100, opacity: 0, rotateX: -90 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: 'power4.out',
            delay: 0.3,
          }
        );
      }

      // Content animation
      gsap.fromTo(
        contentRef.current?.querySelectorAll('.hero-item') || [],
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.6,
        }
      );

      // Fade out content on scroll
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Floating elements
      gsap.to('.float-element', {
        y: -30,
        duration: 3,
        ease: 'sine.inOut',
        stagger: { each: 0.5, repeat: -1, yoyo: true },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden flex items-center"
    >
      {/* Carousel Images */}
      <div className="absolute inset-0 w-full h-full">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className="absolute inset-0 w-full h-full transition-opacity duration-1000"
            style={{ opacity: index === currentSlide ? 1 : 0 }}
          >
            <img
              src={src}
              alt={`Hero background ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/85 to-dark/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-transparent to-transparent" />
      </div>

      {/* Animated Geometric Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="float-element absolute top-1/4 right-1/4 w-96 h-96 border border-brand-500/20 rounded-full blur-sm" />
        <div className="float-element absolute top-1/3 right-1/3 w-64 h-64 border border-brand-400/15 rounded-full blur-sm" style={{ animationDelay: '1s' }} />
        <div className="float-element absolute top-1/2 right-1/5 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="float-element absolute bottom-1/3 left-1/4 w-48 h-48 bg-brand-600/10 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-px h-40 bg-gradient-to-b from-transparent via-brand-500/40 to-transparent" />
        <div className="absolute top-1/3 right-1/3 w-px h-32 bg-gradient-to-b from-transparent via-brand-400/30 to-transparent" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#2d3572 1px, transparent 1px), linear-gradient(90deg, #2d3572 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 w-full px-6 lg:px-12 pt-32 pb-16 will-change-transform"
      >
        <div className="max-w-5xl">
          <div className="hero-item inline-flex items-center gap-2 glass-light rounded-full px-5 py-2.5 mb-8 glow-pulse">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
            <span className="text-brand-300 text-sm font-semibold tracking-wide">
              Construcción & Infraestructura de Excelencia
            </span>
          </div>

          <h1
            ref={titleRef}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight mb-8"
            style={{ perspective: '1000px' }}
          >
            <span className="word inline-block" style={{ transformOrigin: 'bottom' }}>Construyendo</span>{' '}
            <span className="word inline-block" style={{ transformOrigin: 'bottom' }}>el</span>{' '}
            <span className="word inline-block gradient-text" style={{ transformOrigin: 'bottom' }}>Futuro</span>
            <br />
            <span className="word inline-block" style={{ transformOrigin: 'bottom' }}>de</span>{' '}
            <span className="word inline-block" style={{ transformOrigin: 'bottom' }}>Venezuela</span>
          </h1>

          <p className="hero-item text-xl sm:text-2xl text-gray-300 max-w-3xl mb-10 leading-relaxed font-light">
            Más de una década de experiencia en obras civiles, infraestructura eléctrica
            y espacios institucionales. <span className="text-brand-300 font-medium">Creamos espacios dignos, funcionales y sostenibles.</span>
          </p>

          <div className="hero-item flex flex-wrap gap-5 mb-16">
            <button
              onClick={scrollToProjects}
              className="group relative bg-brand-500 hover:bg-brand-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-500 hover:shadow-glow-xl flex items-center gap-3 btn-shine overflow-hidden"
            >
              <span className="relative z-10">Ver Proyectos</span>
              <ArrowRight className="relative z-10 w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group glass border-2 border-brand-500/30 hover:border-brand-500 text-white px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-500 hover:bg-brand-500/10 backdrop-blur-sm"
            >
              Contáctanos
            </a>
          </div>

          <div className="hero-item grid grid-cols-3 gap-8 sm:gap-12">
            {[
              { number: '10', suffix: '+', label: 'Años de Experiencia' },
              { number: '50', suffix: '+', label: 'Proyectos Ejecutados' },
              { number: '6', suffix: '+', label: 'Estados Cubiertos' },
            ].map((stat, index) => (
              <div key={index} className="group text-center sm:text-left">
                <div className="flex items-baseline justify-center sm:justify-start gap-1 mb-2">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-400 group-hover:text-brand-300 transition-colors duration-300">
                    {stat.number}
                  </span>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-500 group-hover:text-brand-400 transition-colors duration-300">
                    {stat.suffix}
                  </span>
                </div>
                <p className="text-gray-400 text-sm sm:text-base font-medium">{stat.label}</p>
                <div className="w-12 h-1 bg-gradient-to-r from-brand-500 to-transparent mt-2 mx-auto sm:mx-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-20 right-8 z-20 flex items-center gap-3">
        <button
          onClick={() => handleManualNav(prevSlide)}
          className="w-10 h-10 rounded-full bg-dark/60 hover:bg-brand-500 border border-white/10 hover:border-brand-500 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleManualNav(() => goToSlide(index))}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 h-2 bg-brand-400'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => handleManualNav(nextSlide)}
          className="w-10 h-10 rounded-full bg-dark/60 hover:bg-brand-500 border border-white/10 hover:border-brand-500 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
          aria-label="Imagen siguiente"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-dark to-transparent pointer-events-none z-20" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-brand-500/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-brand-500 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
