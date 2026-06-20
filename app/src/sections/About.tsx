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

      {/* Vehicle Gallery Modal - Similar to About Carousel */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] bg-dark border-gray-800 text-white p-0 overflow-hidden" showCloseButton={false}>
          {isGalleryOpen && (
            <div className="relative flex flex-col h-full rounded-2xl overflow-hidden bg-dark">
              {/* Close Button */}
              <button onClick={() => setIsGalleryOpen(false)} className="absolute top-3 right-3 z-30 w-10 h-10 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-lg">
                <X className="w-5 h-5 text-white" />
              </button>
              
              {/* Header */}
              <div className="relative w-full h-[10%] bg-dark-50 flex-shrink-0 flex items-center justify-center border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-brand-500" />
                  <h3 className="text-xl font-bold text-white">Flota de Vehículos</h3>
                </div>
              </div>
              
              {/* Main Image Area - Similar to About Carousel */}
              <div className="relative w-full h-[85%] bg-dark-50 flex-shrink-0 flex items-center justify-center">
                <div className="relative w-full h-full overflow-hidden">
                  {/* Current Image */}
                  <img
                    src={vehicleImages[vehicleGalleryIndex]}
                    alt={`Vehículo ${vehicleGalleryIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/30 via-transparent to-transparent" />
                  
                  {/* Navigation Controls - Similar to About Carousel */}
                  {vehicleImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        onMouseEnter={() => setIsPlaying(false)}
                        onMouseLeave={() => setIsPlaying(true)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10 shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      
                      <button
                        onClick={nextImage}
                        onMouseEnter={() => setIsPlaying(false)}
                        onMouseLeave={() => setIsPlaying(true)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10 shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute top-4 right-4 bg-dark/80 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-medium">
                    {vehicleGalleryIndex + 1} / {vehicleImages.length}
                  </div>
                  
                  {/* Progress Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {vehicleImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setVehicleGalleryIndex(index)}
                        onMouseEnter={() => setIsPlaying(false)}
                        onMouseLeave={() => setIsPlaying(true)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === vehicleGalleryIndex
                            ? 'bg-white w-4'
                            : 'bg-white/50 hover:bg-white/80 w-2'
                        }`}
                        aria-label={`Ir a vehículo ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default About;
