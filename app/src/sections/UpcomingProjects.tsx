import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, TrendingUp, ArrowRight, Maximize2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface UpcomingProject {
  id: number;
  title: string;
  category: string;
  location: string;
  estimatedStart: string;
  description: string;
  image: string;
  status: 'por ejecutar' | 'approved' | 'starting-soon';
  virtual360Link?: string; // Link opcional para vista 360
}

const UpcomingProjects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const upcomingProjects: UpcomingProject[] = [
    {
      id: 1,
      title: 'Taller de reparación de transformadores San Fernando de Apure',
      category: 'Infraestructura eléctrica',
      location: 'San Fernando de apure, Estado Apure',
      estimatedStart: '1 Mes',
      description: 'Construcción de centro comercial moderno con 50 locales comerciales y estacionamiento subterráneo.',
      image: '/taller-apure.jpg',
      status: 'por ejecutar',
      virtual360Link: 'https://kuula.co/share/collection/71nxp?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1'
    },
    {
      id: 2,
      title: 'Construcción de taller de reparación de transformadores subestacion «El Bosque',
      category: 'Infraestructura eléctrica',
      location: 'Sector El Bosque, autopista El Vigía – Mérida',
      estimatedStart: '1 Mes',
      description: 'Adecuación integral del galpón ubicado en la Subestación El Bosque.',
      image: '/taller-elbosque.jpg',
      status: 'por ejecutar',
      virtual360Link: 'https://kuula.co/post/hnZJP/collection/7D4pF'
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
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'starting-soon':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'approved':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'starting-soon':
        return 'Próximamente';
      case 'approved':
        return 'Aprobado';
      case 'planning':
        return 'En Planificación';
      default:
        return status;
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
      className="relative w-full py-24 lg:py-32 bg-dark-50"
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

          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Innovación y crecimiento en cada proyecto. Conoce las obras que transformarán el futuro.
          </p>
        </div>

        {/* Projects Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {upcomingProjects.map((project) => (
            <div
              key={project.id}
              className="upcoming-card group relative"
              style={{ perspective: '1000px' }}
            >
              <div className="relative bg-dark border border-gray-800 hover:border-brand-500/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-glow transform hover:-translate-y-2">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-medium border backdrop-blur-sm ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 bg-dark/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-white border border-white/10">
                    {project.category}
                  </div>

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
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span>Inicio estimado: {project.estimatedStart}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <TrendingUp className="w-4 h-4 text-brand-400 flex-shrink-0" />                    </div>
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
    </section>
  );
};

export default UpcomingProjects;
