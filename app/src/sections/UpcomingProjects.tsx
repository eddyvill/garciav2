import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, TrendingUp, ArrowRight, Maximize2, X, ChevronLeft, ChevronRight, Play, FileText } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

interface UpcomingProject {
  id: number;
  title: string;
  category: string;
  location: string;
  estimatedStart: string;
  description: string;
  image: string;
  images: string[];
  status: 'por ejecutar' | 'approved' | 'starting-soon';
  virtual360Link?: string;
  videoLink?: string;
  pdfUrl?: string;
  fullDescription?: string;
}

const UpcomingProjects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<UpcomingProject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const upcomingProjects: UpcomingProject[] = [
    {
      id: 1,
      title: 'Taller de reparación de transformadores San Fernando de Apure',
      category: 'Infraestructura eléctrica',
      location: 'San Fernando de apure, Estado Apure',
      estimatedStart: '1 Mes',
      description: 'Solicitar la ejecución del servicio de remodelación y adecuación integral del galpón ubicado en la Subestación El Bosque',
      image: '/taller-apure.jpg',
      status: 'por ejecutar',
      virtual360Link: 'https://kuula.co/share/collection/71nxp?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
      images: ['/Tallerapure_imagen.png' , '/Tallerapure_imagen2.png' ], 
        videoLink: 'https://youtu.be/z_c6tpRp3P4',
          pdfUrl: '/pdfs/Tallerapure.pdf',

    },
    {
      id: 2,
      title: 'Construcción de taller de reparación de transformadores subestacion El Bosque',
      category: 'Infraestructura eléctrica',
      location: 'Sector El Bosque, autopista El Vigía – Mérida',
      estimatedStart: '1 Mes',
      description: 'Adecuación integral del galpón ubicado en la Subestación El Bosque.',
      image: '/taller-elbosque.jpg',
      status: 'por ejecutar',
      virtual360Link: 'https://kuula.co/post/hnZJP/collection/7D4pF',
      images: ['/taller-elbosque.jpg'],
              videoLink: 'https://youtu.be/uxIpBHVaP6I',
         pdfUrl: '/pdfs/Elvigia_merida.pdf',
    },
    {
      id: 3,
      title: 'Taller de Reparación de Transformadores Valera – Trujillo',
      category: 'Infraestructura eléctrica',
      location: 'Valera, Edo. Trujillo',
      estimatedStart: '1 Mes',
      description: 'Servicio y mantenimiento de climatización, instalaciones eléctricas, pintura en general.',
      image: 'taller-valera.jpg',
      status: 'por ejecutar',
      virtual360Link: 'https://kuula.co/share/collection/71n66?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
      images: ['taller-valera.jpg'],
              videoLink: 'https://youtu.be/3nBAMRR238c',
         pdfUrl: '/pdfs/Trujillo.pdf',
    },
    {
      id: 4,
      title: 'Adecuación de Container para Oficina de Atención al Usuario en CORPOELEC Carúpano',
      category: 'Infraestructura eléctrica',
      location: 'Carúpano, Edo. Sucre',
      estimatedStart: '1 Mes',
      description: 'Adecuación de container para oficina de atención al usuario en CORPOELEC Carúpano.',
      image: '/Container.jpg',
      status: 'por ejecutar',
      images: ['/Container.jpg', '/Container2.jpg', '/Container3.jpg'],
      pdfUrl: '/pdfs/ADECUACION DE CONTAINER PARA ATENCION AL USUARIO, CORPOELEC, CAURPANO.pdf',
      virtual360Link: 'https://kuula.co/share/hzStW/collection/7HF9l?logo=1&card=1&info=1&logosize=56&fs=1&vr=1&zoom=1&sd=1&initload=0&thumbs=1&inst=es',
    },
    {
      id: 5,
      title: 'Remodelación de Oficinas del Ministerio del Poder Popular para la Energia Eléctrica  ',
      category: 'Infraestructura eléctrica',
      location: 'Nº 18 Av. Gamboa, Caracas 1011, Distrito Capital, Venezuela',
      estimatedStart: '1 Mes',
      description: 'Remodelación integral de oficinas, incluyendo adecuación de espacios y mejoras en infraestructura.',
      image: '/Remodelaciondeoficina.jpg',
      status: 'por ejecutar',
      images: ['/Remodelaciondeoficina.jpg', '/Remodelaciondeoficina2.jpg','/Remodelaciondeoficina3.jpg', '/Remodelaciondeoficina34.jpg'],
      pdfUrl: '/pdfs/REMODELACION-OFICINAS.pdf',
      virtual360Link: 'https://kuula.co/share/collection/71Rpw?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',

    },
    {
      id: 6,
      title: 'Ampliación y Remodelación de Sala 1x10 DEL EDIFICIO SEDE DE CORPOELEC, PUERTO LA CRUZ, ESTADO ANZOÁTEGUI',
      category: 'Infraestructura eléctrica',
      location: 'Piso 2, Edif. Sede CORPOELEC, Puerto la Cruz',
      estimatedStart: '1 Mes',
      description: 'Ampliación y remodelación de sala 1x10, incluyendo trabajos de infraestructura civil y adecuación de espacios.',
      image: '/Sala1x10-2.jpg',
      status: 'por ejecutar',
      images: ['/Sala1x10.jpg', '/Sala1x10-2.jpg', '/Sala1x10-3.jpg'],
      pdfUrl: '/pdfs/AMPLIACION-Y-REMODELACION-SALA-1X10.pdf',
      virtual360Link: 'https://kuula.co/share/collection/7HLYC?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
    },
  ];

  const nextModalImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.images!.length);
    }
  };

  const prevModalImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProject.images!.length) % selectedProject.images!.length);
    }
  };



  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger animation from bottom with rotation
      gsap.fromTo(
        cardsRef.current?.querySelectorAll('.upcoming-card') || [],
        { 
          y: 100, 
          opacity: 0, 
          rotateX: -15,
          scale: 0.9
        },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="upcoming-projects"
      ref={sectionRef}
      className="relative w-full py-16 lg:py-20 bg-dark-50"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
            <TrendingUp className="w-4 h-4 text-brand-400 animate-pulse" />
            <span className="text-brand-400 text-sm font-medium">
              Próximos Desarrollos
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Proyectos por{' '}
            <span className="gradient-text">Ejecutar</span>
          </h2>

          <p className="text-gray-500 text-lg max-w-3xl mx-auto">
            Innovación y crecimiento en cada proyecto
          </p>
        </div>

        {/* Projects Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {upcomingProjects.map((project) => (
            <div
              key={project.id}
              className="upcoming-card group relative cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={() => {
                setSelectedProject(project);
                setCurrentImageIndex(0);
              }}
            >
              <div className="relative bg-dark border border-gray-800 hover:border-brand-500/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-glow transform hover:-translate-y-2">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Remove dark overlay - clean image */}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-400 transition-colors line-clamp-2">
                    {project.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Info Grid */}
                  {/* Info Grid */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span>Inicio estimado: {project.estimatedStart}</span>
                    </div>
                  </div>
                  {/* CTA - Vista 360 */}
                  {project.virtual360Link ? (
                    <a
                      href={project.virtual360Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-400 font-medium text-sm group-hover:gap-3 transition-all hover:text-brand-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Vista 360°</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                      <span>Próximamente</span>
                    </div>
                  )}
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl border-2 border-brand-500/50 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            ¿Tienes un proyecto en mente?
          </p>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-glow-lg btn-shine"
          >
            Solicitar Cotización
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[95vh] bg-dark border-gray-800 text-white p-0 overflow-hidden" showCloseButton={false}>
          {selectedProject && (
            <div className="relative flex flex-col h-full rounded-2xl overflow-hidden bg-dark">
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-3 right-3 z-30 w-10 h-10 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Top: Image Carousel */}
              {/* Top: Image Carousel */}
              <div className="relative w-full h-[45%] bg-dark-50 flex-shrink-0">
                <img
                  src={selectedProject.images && selectedProject.images.length > 0 ? selectedProject.images[currentImageIndex] : selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />

                {/* Location Badge - Floating */}
                <div className="absolute bottom-4 left-4 right-4 glass backdrop-blur-xl px-4 py-3 rounded-xl border border-white/20 shadow-2xl">
                  <p className="text-gray-300 text-xs mb-1">Ubicación</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <span className="text-white font-semibold text-base">{selectedProject.location}</span>
                  </div>
                </div>
                
                {/* Carousel Controls */}
                {selectedProject.images && selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={prevModalImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10 shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={nextModalImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10 shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>

                    {/* Image Indicators */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {selectedProject.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? 'bg-white w-6'
                              : 'bg-white/50 hover:bg-white/80 w-1.5'
                          }`}
                          aria-label={`Ver imagen ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Image Counter Badge */}
                    <div className="absolute top-3 right-3 bg-dark/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-medium">
                      {currentImageIndex + 1}/{selectedProject.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Bottom: Content */}
              <div className="relative flex-1 bg-dark overflow-y-auto">
                <div className="p-6">
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-6 pr-10 leading-tight">
                    {selectedProject.title}
                  </h2>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                      <span className="w-0.5 h-5 bg-brand-500 rounded-full" />
                      Descripción
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      {selectedProject.fullDescription || selectedProject.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Primera fila: Vista 360 y PDF */}
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProject.virtual360Link && (
                        <a
                          href={selectedProject.virtual360Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 hover:border-brand-500/50 text-brand-300 hover:text-brand-200 transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-glow"
                        >
                          <Maximize2 className="w-5 h-5" />
                          Vista 360°
                        </a>
                      )}
                      {selectedProject.pdfUrl && (
                        <a
                          href={selectedProject.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 hover:border-brand-500/50 text-brand-300 hover:text-brand-200 transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-glow"
                        >
                          <FileText className="w-5 h-5" />
                          Ver PDF
                        </a>
                      )}
                    </div>
                    
                    {/* Segunda fila: Video (ocupa todo el ancho) */}
                    {selectedProject.videoLink && (
                      <a
                        href={selectedProject.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 hover:border-brand-500/50 text-brand-300 hover:text-brand-200 transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-glow"
                      >
                        <Play className="w-5 h-5" />
                        Ver Video
                      </a>
                    )}
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

export default UpcomingProjects;
