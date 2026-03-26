import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Quote, Truck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array de imágenes de vehículos - puedes cambiar estas rutas
  const vehicleImages = [
    '/Camion_cestaford.jpg',
    '/Camion_5.jpg',
    '/Camion_6.jpg',
    '/Camion_2.jpg',
    '/Camion_3.jpg',
     '/Camion_4.jpg',
       '/Camion_7.jpg',
        '/Camion_8.jpg',
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % vehicleImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + vehicleImages.length) % vehicleImages.length);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image reveal animation
      gsap.fromTo(
        imageRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content fade in
      gsap.fromTo(
        contentRef.current?.querySelectorAll('.content-item') || [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);


  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-dark"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-brand-500/5 to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Column */}
          <div ref={imageRef} className="relative">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="/about-image.jpg"
                alt="Equipo García Construcciones"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-6 lg:right-8 bg-dark-50 border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center">
                  <Award className="w-7 h-7 text-brand-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">2015</p>
                  <p className="text-gray-400 text-sm">Año de Fundación</p>
                </div>
              </div>
            </div>

            {/* Decorative line */}
            <div className="absolute -left-4 top-1/4 w-px h-32 bg-gradient-to-b from-brand-500 to-transparent" />
          </div>

          {/* Content Column */}
          <div ref={contentRef}>
            <div className="content-item inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              <span className="text-brand-400 text-sm font-medium">
                Sobre Nosotros
              </span>
            </div>

            <h2 className="content-item text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Nuestra{' '}
              <span className="gradient-text">Historia</span>
            </h2>

            <p className="content-item text-gray-300 text-lg leading-relaxed mb-6">
              <strong className="text-white">García Construcciones 503 C.A.</strong> nació formalmente 
              el 2 de marzo del año 2015, pero su verdadero origen se remonta mucho antes, cuando la 
              visión y el esfuerzo constante de su fundador, <strong className="text-white">Abelardo Ignacio García Vera</strong>, 
              comenzaron a trazar el camino de lo que hoy se ha consolidado como una empresa referente 
              en el sector de la construcción en Venezuela.
            </p>

            <p className="content-item text-gray-400 leading-relaxed mb-8">
              Con más de una década de experiencia personal en obras civiles, proyectos de infraestructura 
              y desarrollos urbanos, la empresa se propuso como objetivo ser más que una constructora: 
              aspiraba a convertirse en un actor relevante en el desarrollo del país.
            </p>

            {/* Quote */}
            <div className="content-item bg-dark-50 border-l-4 border-brand-500 rounded-r-xl p-6 mb-10">
              <Quote className="w-8 h-8 text-brand-500/30 mb-2" />
              <p className="text-gray-300 italic text-lg leading-relaxed">
                "Construir no es solo levantar estructuras, sino crear espacios dignos, 
                funcionales y sostenibles que mejoren la calidad de vida de las personas."
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="content-item flex flex-wrap gap-4">
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-400 font-semibold transition-colors group"
              >
                Conoce nuestros proyectos 
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </a>
              
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="inline-flex items-center gap-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 hover:border-brand-500/50 text-brand-400 hover:text-brand-300 px-6 py-3 rounded-xl font-semibold transition-all duration-300 group"
              >
                <Truck className="w-5 h-5" />
                Ver Flota de Vehículos
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Vehicle Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="!max-w-4xl w-[90vw] sm:w-[80vw] lg:w-[70vw] max-h-[90vh] bg-dark border-gray-800 text-white p-0 overflow-hidden left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]" showCloseButton={false}>
          <div className="relative flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="relative z-20 flex items-center justify-between p-6 bg-dark/95 backdrop-blur-xl border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Flota de Vehículos</h3>
                  <p className="text-sm text-gray-400">Equipamiento profesional para cada proyecto</p>
                </div>
              </div>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="w-10 h-10 bg-dark-50 hover:bg-brand-500 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Main Image Display */}
            <div className="relative flex-1 bg-black min-h-0">
              <img
                src={vehicleImages[currentImageIndex]}
                alt={`Vehículo ${currentImageIndex + 1}`}
                className="w-full h-full object-contain p-4"
              />

              {/* Navigation Arrows */}
              {vehicleImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-dark/90 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-xl hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-dark/90 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-xl hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-dark/90 backdrop-blur-xl px-4 py-2 rounded-full border border-gray-700">
                <span className="text-white font-semibold">
                  {currentImageIndex + 1} / {vehicleImages.length}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {vehicleImages.length > 1 && (
              <div className="relative z-20 p-4 bg-dark/95 backdrop-blur-xl border-t border-gray-800">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-500 scrollbar-track-gray-800">
                  {vehicleImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'border-brand-500 scale-105 shadow-glow'
                          : 'border-gray-700 hover:border-brand-500/50 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default About;
