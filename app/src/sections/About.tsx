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
  const [aboutCarouselIndex, setAboutCarouselIndex] = useState(0);
  const [vehicleGalleryIndex, setVehicleGalleryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Array de imágenes para el carrusel de la sección ABOUT (14 imágenes)
  const aboutCarouselImages = [
    '/C1.png',
    '/C2.png',
    '/C3.png',
    '/C4.png',
    '/C5.png',
    '/C6.png',
    '/C7.png',
    '/C10.png',
    '/C11.png',
    '/C12.png',
    '/C13.png',
    '/C14.png',
    '/C15.png',
  ];

  // Array de imágenes de vehículos - imágenes numeradas del 1 al 15
  const vehicleImages = [
    '/1.png',
    '/2.png',
    '/3.png',
    '/4.png',
    '/5.png',
    '/6.png',
    '/7.png',
    '/8.png',
    '/9.png',
    '/10.png',
    '/11.png',
    '/12.png',
    '/13.png',
    '/14.png',
    '/15.png',
  ];

  // Funciones para el carrusel ABOUT
  const nextCarouselImage = () => {
    setAboutCarouselIndex((prev) => (prev + 1) % aboutCarouselImages.length);
  };

  const prevCarouselImage = () => {
    setAboutCarouselIndex((prev) => (prev - 1 + aboutCarouselImages.length) % aboutCarouselImages.length);
  };

  const goToCarouselImage = (index: number) => {
    setAboutCarouselIndex(index);
  };

  // Funciones para la galería de vehículos
  const nextImage = () => {
    setVehicleGalleryIndex((prev) => (prev + 1) % vehicleImages.length);
  };

  const prevImage = () => {
    setVehicleGalleryIndex((prev) => (prev - 1 + vehicleImages.length) % vehicleImages.length);
  };

  // Efecto para autoplay del carrusel ABOUT
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isPlaying) {
      intervalId = setInterval(() => {
        setAboutCarouselIndex((prev) => (prev + 1) % aboutCarouselImages.length);
      }, 3000); // Cambia cada 3 segundos
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, aboutCarouselImages.length]);

  // Efecto para autoplay del carrusel de vehículos
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isPlaying) {
      intervalId = setInterval(() => {
        setVehicleGalleryIndex((prev) => (prev + 1) % vehicleImages.length);
      }, 3000); // Cambia cada 3 segundos
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, vehicleImages.length]);

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
              {/* Carrusel de imágenes */}
              <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden rounded-2xl">
                {/* Imagen actual del carrusel */}
                <img
                  src={aboutCarouselImages[aboutCarouselIndex]}
                  alt={`Imagen ${aboutCarouselIndex + 1} de García Construcciones`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
                
                {/* Controles del carrusel */}
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  {/* Botón izquierdo */}
                  <button
                    onClick={prevCarouselImage}
                    onMouseEnter={() => setIsPlaying(false)}
                    onMouseLeave={() => setIsPlaying(true)}
                    className="w-12 h-12 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-xl hover:scale-110 z-20"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  
                  {/* Botón derecho */}
                  <button
                    onClick={nextCarouselImage}
                    onMouseEnter={() => setIsPlaying(false)}
                    onMouseLeave={() => setIsPlaying(true)}
                    className="w-12 h-12 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-xl hover:scale-110 z-20"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                {/* Indicadores (dots) - OCULTOS */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20 hidden">
                  {aboutCarouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToCarouselImage(index)}
                      onMouseEnter={() => setIsPlaying(false)}
                      onMouseLeave={() => setIsPlaying(true)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === aboutCarouselIndex
                          ? 'bg-brand-500 scale-125'
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Contador de imágenes */}
                <div className="absolute bottom-4 left-4 bg-dark/80 backdrop-blur-xl px-3 py-1 rounded-full border border-gray-700 z-20">
                  <span className="text-white text-sm font-semibold">
                    {aboutCarouselIndex + 1} / {aboutCarouselImages.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-6 lg:right-8 bg-dark-50 border border-gray-800 rounded-2xl p-6 shadow-2xl z-10">
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
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="inline-flex items-center gap-3 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 hover:border-brand-500/50 text-brand-400 hover:text-brand-300 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 group"
              >
                <Truck className="w-6 h-6" />
                Ver Flota de Vehículos
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Professional Vehicle Gallery Modal - Clean Light Design */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="!max-w-7xl w-[98vw] sm:w-[96vw] lg:w-[94vw] h-[98vh] max-h-[98vh] bg-white/95 backdrop-blur-2xl border border-gray-200/50 shadow-2xl p-0 overflow-hidden left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]" showCloseButton={false}>
          {/* Dark Blur Background (85% opacity) */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl -z-10" />
          
          <div className="relative h-full max-h-[98vh] flex flex-col">
            {/* Professional Header */}
            <div className="relative z-30 flex items-center justify-between p-6 bg-white/90 backdrop-blur-xl border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-sans">Flota de Vehículos</h3>
                  <p className="text-sm text-gray-600 font-sans mt-1">
                    {vehicleGalleryIndex + 1} de {vehicleImages.length} imágenes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="w-11 h-11 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md border border-gray-200/60 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-h-0">
              {/* Control Panel - Left Sidebar with Vertical Preview Cards */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-3 h-full">
                  
                  {/* Vertical Preview Cards Container - Compact */}
                  <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100/50">
                    <div className="space-y-2 pr-1">
                      {vehicleImages.map((image, index) => {
                        const isCurrent = index === vehicleGalleryIndex;
                        return (
                          <button
                            key={index}
                            onClick={() => setVehicleGalleryIndex(index)}
                            className={`w-full flex flex-col p-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
                              isCurrent
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-2 border-blue-500/30 shadow-md'
                                : 'bg-white/80 hover:bg-gray-50/90 border border-gray-200/60 hover:border-blue-300/50'
                            }`}
                          >
                            {/* Preview Card Header - No Numbers */}
                            <div className="flex items-center justify-center mb-2">
                              {isCurrent && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                                  Actual
                                </span>
                              )}
                            </div>
                            
                            {/* Smaller Stylized Thumbnail - No Numbers */}
                            <div className="relative w-full h-20 rounded-lg overflow-hidden shadow-sm">
                              <img
                                src={image}
                                alt={`Vehículo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* Overlay gradient */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                            </div>
                            
                            {/* Card Footer - Removed text */}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Image Display Area */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                <div className="relative w-full max-w-5xl">
                  {/* Main Image Container - Clean Professional Design */}
                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200/40 flex items-center justify-center p-8">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={vehicleImages[vehicleGalleryIndex]}
                        alt={`Vehículo ${vehicleGalleryIndex + 1}`}
                        className="max-w-full max-h-[75vh] object-contain"
                      />
                    </div>
                    
                    {/* Professional Navigation Arrows */}
                    {vehicleImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          onMouseEnter={() => setIsPlaying(false)}
                          onMouseLeave={() => setIsPlaying(true)}
                          className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-blue-50 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-xl hover:scale-110 z-20 border border-gray-200/60"
                        >
                          <ChevronLeft className="w-7 h-7 text-gray-700" />
                        </button>
                        
                        <button
                          onClick={nextImage}
                          onMouseEnter={() => setIsPlaying(false)}
                          onMouseLeave={() => setIsPlaying(true)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-blue-50 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-xl hover:scale-110 z-20 border border-gray-200/60"
                        >
                          <ChevronRight className="w-7 h-7 text-gray-700" />
                        </button>
                      </>
                    )}
                    
                    {/* Professional Image Counter */}
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-full border border-gray-200/60 shadow-lg">
                      <span className="text-gray-900 font-semibold text-lg font-sans">
                        {vehicleGalleryIndex + 1} / {vehicleImages.length}
                      </span>
                    </div>
                    
                    {/* Autoplay Control - Icon Only */}
                    <div className="absolute bottom-6 right-6">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 bg-white/95 backdrop-blur-xl rounded-full border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50/80 flex items-center justify-center"
                        title={isPlaying ? 'Pausar autoplay' : 'Reanudar autoplay'}
                      >
                        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                      </button>
                    </div>
                  </div>
                  

                  
                  {/* Progress Dots - Minimalist */}
                  <div className="flex justify-center gap-2 mt-6">
                    {vehicleImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setVehicleGalleryIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === vehicleGalleryIndex
                            ? 'bg-blue-600 scale-150'
                            : 'bg-gray-400 hover:bg-gray-600'
                        }`}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default About;
