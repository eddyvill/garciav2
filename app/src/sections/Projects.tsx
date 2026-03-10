import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
}

const Projects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cardImageIndex, setCardImageIndex] = useState<Record<number, number>>({});

  const filters = ['Todos', 'Infraestructura Eléctrica', 'Institucional', 'Educativo', 'Rehabilitación'];

  const projects: Project[] = [
    {
      id: 1,
      title: 'Edificio Sede CORPOELEC Cumaná',
      category: 'Infraestructura Eléctrica',
      location: 'Cumaná, Edo. Sucre',
      area: '1.500 m²',
      duration: '4 meses',
      description: 'Rehabilitación integral del edificio sede de CORPOELEC en Cumaná, incluyendo impermeabilización, reacondicionamiento eléctrico, restauración estructural, áreas operativas y administrativas.',
      images: ['/project-corpoelec-cumana.jpg', '/project-corpoelec-cumana2.jpg'],
      details: [
        'Impermeabilización completa de techos',
        'Reacondicionamiento del sistema eléctrico',
        'Restauración estructural',
        'Adecuación de áreas operativas',
        'Modernización de espacios administrativos'
      ],
    },
    {
      id: 2,
      title: 'Subestación Manzanares 115/13.8 KV',
      category: 'Infraestructura Eléctrica',
      location: 'Cumaná, Edo. Sucre',
      area: '198 m²',
      duration: '3 meses',
      description: 'Servicio y mantenimiento de climatización, instalaciones eléctricas, pintura general, adecuación de baños y reparación de muro perimetral.',
      images: ['/project-subestacion-manzanares.jpg', '/project-subestacion2.jpg'],
      details: [
        'Mantenimiento de sistema de climatización',
        'Actualización de instalaciones eléctricas',
        'Pintura general de instalaciones',
        'Reparación de muro perimetral'
      ],
    },
    {
      id: 3,
      title: 'Subestación Araya 34.5/13.8 KV',
      category: 'Infraestructura Eléctrica',
      location: 'Araya, Edo. Sucre',
      area: '61 m²',
      duration: '1 mes',
      description: 'Mantenimiento de áreas internas y externas, recuperación de infraestructura deteriorada, techos, paredes e instalaciones eléctricas.',
      images: ['/project-subestacion-araya.jpg', '/project-subestacion-araya5.jpg'],
      details: [
        'Recuperación de infraestructura',
        'Reparación de techos',
        'Mantenimiento de instalaciones eléctricas'
      ],
    },
    {
      id: 4,
      title: 'UNEXEE Núcleo Falcón',
      category: 'Educativo',
      location: 'Punto Fijo, Edo. Falcón',
      area: '150 m²',
      duration: '3 meses',
      description: 'Adecuación de espacios internos y externos, cubierta, rehabilitación de fachadas, climatización, instalaciones sanitarias y dotación de salones.',
      images: ['/project-unexee.jpg', '/project-unexee2.jpg'],
      details: [
        'Rehabilitación de fachadas',
        'Sistema de climatización',
        'Instalaciones sanitarias',
        'Dotación de salones'
      ],
    },
    {
      id: 5,
      title: 'Centro de Alimentación Guanta',
      category: 'Rehabilitación',
      location: 'Guanta, Edo. Anzoátegui',
      area: '38 m²',
      duration: '3 meses',
      description: 'Ampliación y adecuación de espacios del centro de alimentación nutricional en la planta de generación.',
      images: ['/project-alimentacion-guanta.jpg'],
      details: [
        'Ampliación de espacios',
        'Adecuación nutricional',
        'Mejoras en infraestructura'
      ],
    },
    {
      id: 6,
      title: 'Taller de Reparación de Transformadores',
      category: 'Institucional',
      location: 'Chacao, Edo. Miranda',
      area: '56 m²',
      duration: '3 meses',
      description: 'Construcción de oficinas y dormitorios del taller de reparación de transformadores, ampliación y adecuación integral.',
      images: ['/project-taller.jpg', '/project-taller2.jpg'],
      details: [
        'Construcción de oficinas',
        'Dormitorios para personal',
        'Ampliación de taller'
      ],
    },
  ];

  const filteredProjects = activeFilter === 'Todos' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

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
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [filteredProjects]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-dark"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-brand-400 text-sm font-medium">
              Portafolio de Obras
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Proyectos{' '}
            <span className="gradient-text">Ejecutados</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Más de 50 obras completadas con éxito en toda Venezuela
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-dark-50 text-gray-400 border border-gray-800 hover:border-brand-500/50 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div ref={gridRef} className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredProjects.map((project) => {
            const currentIndex = cardImageIndex[project.id] || 0;
            return (
              <div
                key={project.id}
                className="project-card group relative bg-dark-50 border border-gray-800 hover:border-brand-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 card-hover"
                onClick={() => {
                  setSelectedProject(project);
                  setCurrentImageIndex(0);
                }}
              >
                {/* Image Carousel */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.images[currentIndex]}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 project-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-brand-500/90 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                    {project.category}
                  </div>

                  {/* Image Counter */}
                  {project.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-dark/80 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                      {currentIndex + 1}/{project.images.length}
                    </div>
                  )}

                  {/* Carousel Controls */}
                  {project.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => prevImage(project.id, e)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-10"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={(e) => nextImage(project.id, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-dark/80 hover:bg-brand-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-10"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}

                  {/* View Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center shadow-glow">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-brand-500 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    <span className="truncate">{project.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            ¿Quieres ver más proyectos?
          </p>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-glow-lg btn-shine"
          >
            Solicitar portafolio completo
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
              <div className="relative w-full h-[45%] bg-dark-50 flex-shrink-0">
                <img
                  src={selectedProject.images[currentImageIndex]}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Carousel Controls */}
                {selectedProject.images.length > 1 && (
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
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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

              {/* Bottom: Content - No Scroll */}
              <div className="relative flex-1 bg-dark overflow-hidden">
                {/* Content without scroll */}
                <div className="h-full p-5 flex flex-col justify-between">
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-3 pr-10 line-clamp-2 leading-tight">
                    {selectedProject.title}
                  </h2>
                  
                  {/* Info Cards Grid */}
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
                  
                  {/* Category */}
                  <div className="glass-light rounded-lg p-3 border border-white/10 mb-3">
                    <p className="text-gray-400 text-[10px] mb-1">Categoría</p>
                    <span className="inline-block bg-brand-500/20 text-brand-300 px-3 py-1 rounded-lg text-xs font-medium border border-brand-500/30">
                      {selectedProject.category}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-3 flex-shrink-0">
                    <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                      <span className="w-0.5 h-4 bg-brand-500 rounded-full" />
                      Descripción
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Details - Limited */}
                  {selectedProject.details && selectedProject.details.length > 0 && (
                    <div className="flex-1 min-h-0">
                      <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                        <span className="w-0.5 h-4 bg-brand-500 rounded-full" />
                        Detalles del Proyecto
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedProject.details.slice(0, 4).map((detail, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300 text-xs group">
                            <span className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-brand-500/30 transition-colors">
                              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                            </span>
                            <span className="flex-1 leading-relaxed line-clamp-2">{detail}</span>
                          </li>
                        ))}
                        {selectedProject.details.length > 4 && (
                          <li className="text-brand-400 text-[10px] italic pl-6">
                            +{selectedProject.details.length - 4} detalles más
                          </li>
                        )}
                      </ul>
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
