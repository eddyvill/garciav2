import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, ExternalLink, ChevronLeft, ChevronRight, X, FileText, Link as LinkIcon, Play } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  category: string;
  location: string;
  area: string;
  duration: string;
  description: string;
  images: string[];
  details?: string[];
  pdfUrl?: string;
  externalLink?: string;
  videoUrl?: string;
}

const Projects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cardImageIndex, setCardImageIndex] = useState<Record<number, number>>({});

  const projects: Project[] = [
    {
      id: 1,
      title: 'Edificio Sede CORPOELEC Cumaná',
      category: 'Infraestructura Eléctrica',
      location: 'Cumaná, Edo. Sucre',
      area: '1.500 m²',
      duration: '4 meses',
      description: 'Rehabilitación integral del edificio sede de CORPOELEC en Cumaná, incluyendo impermeabilización, reacondicionamiento eléctrico, restauración estructural, áreas operativas y administrativas.',
      images: ['/project-corpoelec-cumana.webp', '/project-corpoelec-cumana2.webp'],
      details: [
        'Impermeabilización completa de techos',
        'Reacondicionamiento del sistema eléctrico',
        'Restauración estructural',
        'Adecuación de áreas operativas',
        'Modernización de espacios administrativos'
      ],
      pdfUrl: '/pdfs/corpoelec-cumana.pdf',
      externalLink: 'https://kuula.co/share/collection/7MpRy?logo=1&info=0&fs=1&vr=1&initload=0&thumbs=1',
      videoUrl: 'https://youtu.be/z9Gwb0_Rrss',
    },
    {
      id: 2,
      title: 'Subestación Manzanares 115/13.8 KV',
      category: 'Infraestructura Eléctrica',
      location: 'Cumaná, Edo. Sucre',
      area: '198 m²',
      duration: '3 meses',
      description: 'Servicio y mantenimiento de climatización, instalaciones eléctricas, pintura general, adecuación de baños y reparación de muro perimetral.',
      images: ['/Manzares_portada.webp','/project-subestacion-manzanares.webp', '/project-subestacion2.webp'],
      details: [
        'Mantenimiento de sistema de climatización',
        'Actualización de instalaciones eléctricas',
        'Pintura general de instalaciones',
        'Reparación de muro perimetral'
      ],
      pdfUrl: '/pdfs/Manzanares.pdf',
    },
    {
      id: 3,
      title: 'Subestación Araya 34.5/13.8 KV',
      category: 'Infraestructura Eléctrica',
      location: 'Araya, Edo. Sucre',
      area: '61 m²',
      duration: '1 mes',
      description: 'Mantenimiento de áreas internas y externas, recuperación de infraestructura deteriorada, techos, paredes e instalaciones eléctricas.',
      images: ['/project-subestacion-araya.webp', '/project-subestacion-araya5.webp'],
      details: [
        'Recuperación de infraestructura',
        'Reparación de techos',
        'Mantenimiento de instalaciones eléctricas'
      ],
      pdfUrl: '/pdfs/Araya.pdf',
    },
    {
      id: 4,
      title: 'Centro de Alimentación Guanta',
      category: 'Rehabilitación',
      location: 'Guanta, Edo. Anzoátegui',
      area: '38 m²',
      duration: '3 meses',
      description: 'Ampliación y adecuación de espacios del centro de alimentación nutricional en la planta de generación.',
      images: ['PORTADA_GUANTA.webp', '/project-alimentacion-guanta.webp'],
      details: [
        'Ampliación de espacios',
        'Adecuación nutricional',
        'Mejoras en infraestructura'
      ],
      pdfUrl: '/pdfs/Guanta.pdf',
    },
    {
      id: 12,
      title: 'UNEXEE Núcleo Falcón',
      category: 'Educativo',
      location: 'Punto Fijo, Edo. Falcón',
      area: '150 m²',
      duration: '3 meses',
      description: 'Adecuación de espacios internos y externos, cubierta, rehabilitación de fachadas, climatización, instalaciones sanitarias y dotación de salones.',
      images: ['/project-unexee.webp', '/project-unexee2.webp'],
      details: [
        'Rehabilitación de fachadas',
        'Sistema de climatización',
        'Instalaciones sanitarias',
        'Dotación de salones'
      ],
      pdfUrl: '/pdfs/UNEXEE2.pdf',
    },
    {
      id: 7,
      title: 'Subestación Chuparín 108MVA-11/13.8KV',
      category: 'Infraestructura Eléctrica',
      location: 'Puerto la Cruz, Edo. Anzoátegui',
      area: '200 m²',
      duration: '4 meses',
      description: 'Mantenimiento y rehabilitación de la subestación Chuparín 108MVA-11/13.8KV, incluyendo trabajos de infraestructura civil, sistemas eléctricos y adecuación de espacios operativos.',
      images: ['/Chuparin-portada.webp','/Chuparin-1.webp', '/Chuparin-2.webp'],
      details: [
        'Rehabilitación de infraestructura civil',
        'Mantenimiento de sistemas eléctricos',
        'Adecuación de espacios operativos'
      ],
      pdfUrl: '/pdfs/Chuparin.pdf',
      externalLink: 'https://kuula.co/share/collection/7DWK9?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
      videoUrl: 'https://youtu.be/cZI0TnbsTF0',
    },
    {
      id: 10,
      title: 'Subestación Casanay',
      category: 'Infraestructura Eléctrica',
      location: 'Casanay, Edo. Sucre',
      area: '180 m²',
      duration: '3 meses',
      description: 'Construcción y puesta en marcha de subestación eléctrica, incluyendo obra civil, montaje de equipos y sistemas de protección.',
      images: ['/Casanay_portada.webp','/project-subestacion-manzanares.webp', '/project-subestacion2.webp'],
      details: [
        'Obra civil para subestación',
        'Montaje de equipos eléctricos',
        'Sistemas de protección',
        'Pruebas y puesta en marcha'
      ],
      pdfUrl: '/pdfs/Casanay.pdf',
    },
    {
      id: 11,
      title: 'Estacionamiento Sede CORPOELEC',
      category: 'Infraestructura',
      location: 'Cumaná, Edo. Sucre',
      area: '500 m²',
      duration: '2 meses',
      description: 'Construcción de estacionamiento para la sede de CORPOELEC, incluyendo pavimentación, señalización y sistemas de drenaje.',
      images: ['/Estacionamiento1.webp','/Estacionamiento2.webp','/Estacionamiento3.webp'],
      details: [
        'Pavimentación de áreas',
        'Señalización horizontal y vertical',
        'Sistema de drenaje pluvial',
        'Iluminación de áreas comunes'
      ],
      pdfUrl: '/pdfs/Estacionamiento.pdf',
    },
    {
      id: 8,
      title: 'Centro de Atención integral al usuario Cariaco (CIAU)',
      category: 'Institucional',
      location: 'Cariaco, Edo. Sucre',
      area: '56 m²',
      duration: '3 meses',
      description: ' Mantenimiento e impermeablización del centro de Atención integral al usuario Cariaco (CIAU).',
      images: ['/Cariaco1.webp', '/Cariaco2.webp'],
      details: [
        'Construcción de oficinas',
        'Dormitorios para personal',
        'Ampliación de taller'
      ],
      pdfUrl: '/pdfs/Cariaco_2.pdf',
    },
    {
      id: 9,
      title: 'Adecuación de la Sede CORPOELEC ARAYA',
      category: 'Institucional',
      location: 'Cumaná, Edo. Sucre',
      area: '250 m²',
      duration: '2 meses',
      description: 'Adecuación y modernización de las instalaciones de la sede de CORPOELEC, incluyendo mejoras en infraestructura, sistemas eléctricos y áreas administrativas.',
      images: ['/Nueva-araya3.webp', '/Nueva-araya.webp', '/Nueva-araya2.webp'],
      details: [
        'Modernización de instalaciones',
        'Mejoras en infraestructura',
        'Actualización de sistemas eléctricos',
        'Renovación de áreas administrativas'
      ],
      pdfUrl: '/pdfs/Araya2.3.pdf',
      videoUrl: 'https://youtu.be/tJ03m6y4gO8',
    },
    {
      id: 13,
      title: 'Comedor Apure',
      category: 'Infraestructura Social',
      location: 'Apure, Venezuela',
      area: '120 m²',
      duration: '4 meses',
      description: 'Construcción y adecuación de comedor social para la comunidad, incluyendo instalaciones sanitarias, cocina equipada, áreas de comedor y espacios de servicio.',
      images: ['/comedor-apure.webp', '/Comedor-apure2.webp', '/Comedor-apure3.webp', '/Comedor-apure4.webp'],
      details: [
        'Construcción de infraestructura completa',
        'Instalación de cocina equipada',
        'Áreas de comedor y servicio',
        'Instalaciones sanitarias',
        'Sistema eléctrico y de ventilación'
      ],
      pdfUrl: '/pdfs/COMEDOR APURE.pdf',
      videoUrl: 'https://youtu.be/iZCa8Ksvbjg',
    }
  ];

  const nextImage = (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCardImageIndex(prev => ({
        ...prev,
        [projectId]: ((prev[projectId] || 0) + 1) % project.images.length
      }));
    }
  };

  const prevImage = (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCardImageIndex(prev => ({
        ...prev,
        [projectId]: ((prev[projectId] || 0) - 1 + project.images.length) % project.images.length
      }));
    }
  };

  const nextModalImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.images.length);
    }
  };

  const prevModalImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProject.images.length) % selectedProject.images.length);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gridRef.current?.querySelectorAll('.project-card') || [],
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.5, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="relative w-full py-24 lg:py-32 bg-dark">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-brand-400 text-sm font-medium">Portafolio de Obras</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Proyectos{' '}<span className="gradient-text">Ejecutados</span>
          </h2>
        </div>

        <div ref={gridRef} className="max-w-7xl mx-auto">
          {/* Renderizar todos los proyectos usando un solo map */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.slice(0, projects.length - 3).map((project) => {
              const currentIndex = cardImageIndex[project.id] || 0;
              
              return (
                <div key={project.id} className="project-card group relative bg-dark-50 border border-gray-800 hover:border-brand-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 card-hover"
                  onClick={() => { setSelectedProject(project); setCurrentImageIndex(0); }}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={project.images[currentIndex]} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 project-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {project.images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-dark/80 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                        {currentIndex + 1}/{project.images.length}
                      </div>
                    )}
                    {project.images.length > 1 && (
                      <>
                        <button onClick={(e) => prevImage(project.id, e)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-10">
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button onClick={(e) => nextImage(project.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-10">
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center shadow-glow">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-brand-500 transition-colors">{project.title}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 text-brand-500" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Últimos 3 proyectos centrados en una fila separada */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-3 gap-6 lg:w-9/12 lg:mx-auto">
                {projects.slice(projects.length - 3).map((project) => {
                  const currentIndex = cardImageIndex[project.id] || 0;
                  
                  return (
                    <div key={project.id} className="project-card group relative bg-dark-50 border border-gray-800 hover:border-brand-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 card-hover"
                      onClick={() => { setSelectedProject(project); setCurrentImageIndex(0); }}>
                      <div className="relative h-48 overflow-hidden">
                        <img src={project.images[currentIndex]} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 project-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {project.images.length > 1 && (
                          <div className="absolute top-3 right-3 bg-dark/80 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                            {currentIndex + 1}/{project.images.length}
                          </div>
                        )}
                        {project.images.length > 1 && (
                          <>
                            <button onClick={(e) => prevImage(project.id, e)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-10">
                              <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <button onClick={(e) => nextImage(project.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-10">
                              <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                          </>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center shadow-glow">
                            <ExternalLink className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-brand-500 transition-colors">{project.title}</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <MapPin className="w-4 h-4 text-brand-500" />
                          <span className="truncate">{project.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[95vh] bg-dark border-gray-800 text-white p-0 overflow-hidden" showCloseButton={false}>
          {selectedProject && (
            <div className="relative flex flex-col h-full rounded-2xl overflow-hidden bg-dark">
              <button onClick={() => setSelectedProject(null)} className="absolute top-3 right-3 z-30 w-10 h-10 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors shadow-lg">
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="relative w-full h-[45%] bg-dark-50 flex-shrink-0">
                <img src={selectedProject.images[currentImageIndex]} alt={selectedProject.title} className="w-full h-full object-cover" />
                {selectedProject.images.length > 1 && (
                  <>
                    <button onClick={prevModalImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10 shadow-lg">
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={nextModalImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10 shadow-lg">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {selectedProject.images.map((_, index) => (
                        <button key={index} onClick={() => setCurrentImageIndex(index)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80 w-1.5'}`}
                          aria-label={`Ver imagen ${index + 1}`} />
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 bg-dark/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-medium">
                      {currentImageIndex + 1}/{selectedProject.images.length}
                    </div>
                  </>
                )}
              </div>
              <div className="relative flex-1 bg-dark overflow-hidden">
                <div className="h-full p-5 flex flex-col justify-between">
                  <h2 className="text-2xl font-bold text-white mb-3 pr-10 line-clamp-2 leading-tight">{selectedProject.title}</h2>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="glass-light rounded-lg p-3 border border-white/10">
                      <p className="text-gray-400 text-[10px] mb-1">Ubicación</p>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        <span className="text-white font-medium text-xs leading-tight">{selectedProject.location}</span>
                      </div>
                    </div>
                    <div className="glass-light rounded-lg p-3 border border-white/10">
                      <p className="text-gray-400 text-[10px] mb-1">Área</p>
                      <span className="text-white font-bold text-base">{selectedProject.area}</span>
                    </div>
                    <div className="glass-light rounded-lg p-3 border border-white/10">
                      <p className="text-gray-400 text-[10px] mb-1">Duración</p>
                      <span className="text-white font-bold text-base">{selectedProject.duration}</span>
                    </div>
                  </div>
                  <div className="mb-3 flex-shrink-0">
                    <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                      <span className="w-0.5 h-4 bg-brand-500 rounded-full" />
                      Descripción
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">{selectedProject.description}</p>
                  </div>
                  {(selectedProject.pdfUrl || selectedProject.externalLink || selectedProject.videoUrl) && (
                    <div className="flex gap-2 mb-3">
                      {selectedProject.pdfUrl && (
                        <a href={selectedProject.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 hover:border-brand-500/50 text-brand-300 hover:text-brand-200 transition-all duration-300 text-xs font-medium">
                          <FileText className="w-4 h-4" />Ver PDF del Proyecto
                        </a>
                      )}
                      {selectedProject.externalLink && (
                        <a href={selectedProject.externalLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 hover:border-brand-500/50 text-brand-300 hover:text-brand-200 transition-all duration-300 text-xs font-medium">
                          <LinkIcon className="w-4 h-4" />Vista 360°
                        </a>
                      )}
                      {selectedProject.videoUrl && (
                        <a href={selectedProject.videoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200 transition-all duration-300 text-xs font-medium">
                          <Play className="w-4 h-4" />Ver Video
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Projects;